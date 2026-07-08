import pool from "@/lib/db";

export interface Poll {
  id: string;
  title: string;
  description: string;
  created_by: string;
  creator_name: string;
  is_active: boolean;
  show_results_before_vote: boolean;
  expires_at: string | null;
  created_at: string;
  total_votes: number;
}

export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  order_index: number;
  vote_count: number;
}

export interface PollDetail extends Poll {
  options: PollOption[];
}

export async function listActivePolls(): Promise<Poll[]> {
  const res = await pool.query<Poll>(`
    SELECT
      p.id, p.title, p.description, p.created_by,
      u.name AS creator_name,
      p.is_active, p.show_results_before_vote,
      p.expires_at, p.created_at,
      COUNT(v.id)::int AS total_votes
    FROM polls p
    JOIN users u ON u.id = p.created_by
    LEFT JOIN votes v ON v.poll_id = p.id
    WHERE p.is_active = TRUE
      AND (p.expires_at IS NULL OR p.expires_at > NOW())
    GROUP BY p.id, u.name
    ORDER BY p.created_at DESC
  `);
  return res.rows;
}

export async function getPollById(pollId: string): Promise<PollDetail | null> {
  const pollRes = await pool.query<Poll>(
    `
    SELECT
      p.id, p.title, p.description, p.created_by,
      u.name AS creator_name,
      p.is_active, p.show_results_before_vote,
      p.expires_at, p.created_at,
      COUNT(v.id)::int AS total_votes
    FROM polls p
    JOIN users u ON u.id = p.created_by
    LEFT JOIN votes v ON v.poll_id = p.id
    WHERE p.id = $1
    GROUP BY p.id, u.name
  `,
    [pollId]
  );

  if (pollRes.rows.length === 0) return null;

  const optRes = await pool.query<PollOption>(
    `
    SELECT
      o.id, o.poll_id, o.text, o.order_index,
      COUNT(v.id)::int AS vote_count
    FROM options o
    LEFT JOIN votes v ON v.option_id = o.id
    WHERE o.poll_id = $1
    GROUP BY o.id
    ORDER BY o.order_index ASC
  `,
    [pollId]
  );

  return { ...pollRes.rows[0], options: optRes.rows };
}

export async function createPoll(data: {
  title: string;
  description: string;
  createdBy: string;
  showResultsBeforeVote: boolean;
  expiresAt: string | null;
  options: string[];
}): Promise<string> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const pollRes = await client.query<{ id: string }>(
      `INSERT INTO polls (title, description, created_by, show_results_before_vote, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        data.title,
        data.description,
        data.createdBy,
        data.showResultsBeforeVote,
        data.expiresAt ?? null,
      ]
    );
    const pollId = pollRes.rows[0].id;

    for (let i = 0; i < data.options.length; i++) {
      await client.query(
        `INSERT INTO options (poll_id, text, order_index) VALUES ($1, $2, $3)`,
        [pollId, data.options[i], i]
      );
    }

    await client.query("COMMIT");
    return pollId;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function closePoll(
  pollId: string,
  userId: string
): Promise<boolean> {
  const res = await pool.query(
    `UPDATE polls SET is_active = FALSE
     WHERE id = $1 AND created_by = $2`,
    [pollId, userId]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function getPollsByUser(userId: string): Promise<Poll[]> {
  const res = await pool.query<Poll>(
    `
    SELECT
      p.id, p.title, p.description, p.created_by,
      u.name AS creator_name,
      p.is_active, p.show_results_before_vote,
      p.expires_at, p.created_at,
      COUNT(v.id)::int AS total_votes
    FROM polls p
    JOIN users u ON u.id = p.created_by
    LEFT JOIN votes v ON v.poll_id = p.id
    WHERE p.created_by = $1
    GROUP BY p.id, u.name
    ORDER BY p.created_at DESC
  `,
    [userId]
  );
  return res.rows;
}
