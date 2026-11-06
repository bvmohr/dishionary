import { ImageResponse } from "next/og";

/**
 * Generates a high-resolution PNG of the Dishionary emblem at /api/logo
 * so Gmail, Apple Mail, Outlook, and Google OAuth consent screens can display
 * the logo (since email clients block raw <svg> tags).
 */
export async function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FAF7F2",
        borderRadius: "48px",
        border: "8px solid #E5DDD3",
      }}
    >
      <svg
        width="192"
        height="192"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="18" cy="7.5" r="1.75" stroke="#C85A32" strokeWidth="1.85" />
        <path
          d="M9.5 16.5C9.5 11.8056 13.3056 8 18 8C22.6944 8 26.5 11.8056 26.5 16.5"
          stroke="#C85A32"
          strokeWidth="1.85"
          strokeLinecap="round"
        />
        <path
          d="M6.5 17.5C10.5 17.5 14.5 18.75 18 21C21.5 18.75 25.5 17.5 29.5 17.5V27.5C25.5 27.5 21.5 28.5 18 30.5C14.5 28.5 10.5 27.5 6.5 27.5V17.5Z"
          stroke="#C85A32"
          strokeWidth="1.85"
          strokeLinejoin="round"
        />
        <path
          d="M18 21V30.25"
          stroke="#C85A32"
          strokeWidth="1.85"
          strokeLinecap="round"
        />
      </svg>
    </div>,
    {
      width: 256,
      height: 256,
    }
  );
}
