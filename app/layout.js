import "./globals.css";

export const metadata = {
  title: "Icyizere Registry",
  description: "A verification and work-history registry for domestic workers in Rwanda.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <div className="wrap">
          <header className="top">
            <a href="/" className="brand">
              <h1>Icyizere Registry</h1>
              <span className="tag">Verified work histories for domestic workers</span>
            </a>
            <nav className="tabs">
              <a href="/">Overview</a>
              <a href="/registry">All Workers</a>
              <a href="/add">Add Worker</a>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
