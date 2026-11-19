import { formatTime } from '../../utils/format.js';

export default function MessageBubble({ message }) {
  const mine = message.role === 'user';
  return (
    <div className={`bubble-row ${mine ? 'is-mine' : 'is-bot'}`}>
      <div className="bubble" data-pending={message.pending ? 'true' : undefined}>
        <p>{message.content}</p>
        <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="bubble-row is-bot" role="status" aria-label="Carl Sagan AI está escrevendo">
      <div className="bubble typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
