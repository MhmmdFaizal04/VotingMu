import PusherJS from "pusher-js";

declare global {
  // eslint-disable-next-line no-var
  var _pusherClient: PusherJS | undefined;
}

function createPusherClient(): PusherJS {
  return new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  });
}

const pusherClient: PusherJS =
  typeof window !== "undefined"
    ? (globalThis._pusherClient ?? createPusherClient())
    : (null as unknown as PusherJS);

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  globalThis._pusherClient = pusherClient;
}

export default pusherClient;
