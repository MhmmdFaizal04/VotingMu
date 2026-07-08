import pool from "@/lib/db";
import { PollOption } from "./polls";

export interface VoteRecord {
  id: string;
  user_id: string;
  poll_id: string;
  option_id: string;
  created_at: string;
  poll_title: string;
  option_text: string;
}

/**
 * Cast or update a vote. Uses UPSERT so the user can change their choice.
 * Returns the option_id that is now recorded.
 */
export async function castVote(
  userId: string,
  pollId: string,
  optionId: string
): Promise<string> {
  await pool.query(
    `INSERT INTO votes (user_id, poll_id, option_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, poll_id)
     DO UPDATE SET option_id = EXCLUDED.option_id, created_at = NOW()`,
    [userId, pollId, optionId]
  );
  return optionId;
}

/** Returns the option the user voted for, or null if not voted */
export async function getUserVote(
  userId: string,
  pollId: string
): Promise<string | null> {
  const res = await pool.query<{ option_id: string }>(
    `SELECT option_id FROM votes WHERE user_id = $1 AND poll_id = $2`,
    [userId, pollId]
  );
  return res.rows[0]?.option_id ?? null;
}

/** Returns current vote counts for all options in a poll */
export async function getVoteCounts(pollId: string): Promise<PollOption[]> {
  const res = await pool.query<PollOption>(
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
  return res.rows;
}

/** Returns all votes cast by a user, with poll and option info */
export async function getVotesByUser(userId: string): Promise<VoteRecord[]> {
  const res = await pool.query<VoteRecord>(
    `
    SELECT
      v.id, v.user_id, v.poll_id, v.option_id, v.created_at,
      p.title AS poll_title,
      o.text  AS option_text
    FROM votes v
    JOIN polls   p ON p.id = v.poll_id
    JOIN options o ON o.id = v.option_id
    WHERE v.user_id = $1
    ORDER BY v.created_at DESC
  `,
    [userId]
  );
  return res.rows;
}
