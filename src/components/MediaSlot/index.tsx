import { memo, type CSSProperties } from "react";
import type { MediaSlotValue } from "../../routes/Media/media-utils.ts";

type MediaSlotProps = {
  media?: MediaSlotValue;
  onClick?: (media: MediaSlotValue) => void;
};

const slotStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "1 / 1",
  overflow: "hidden",
  background: "transparent",
};

function MediaSlot({ media, onClick }: MediaSlotProps) {
  if (!media) {
    return <div style={slotStyle} aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      aria-label="Open media"
      onClick={() => onClick?.(media)}
      style={{
        ...slotStyle,
        position: "relative",
        display: "block",
        border: 0,
        padding: 0,
        cursor: "pointer",
      }}
    >
      <img
        src={media.attachment.sourceUrl}
        alt=""
        draggable={false}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "2px 4px",
          boxSizing: "border-box",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: "#fff",
          fontSize: 12,
          lineHeight: "16px",
          textAlign: "left",
          background: "linear-gradient(transparent, rgba(0, 0, 0, 0.65))",
          pointerEvents: "none",
        }}
      >
        {media.postContent}
      </span>
    </button>
  );
}

export default memo(MediaSlot);
