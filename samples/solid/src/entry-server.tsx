import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
    <StartServer
        document={({ assets, children, scripts }) => (
            <html lang="en">
            <head>
                <title>Vite Sample</title>
                <link rel="icon" href="data:,"/>
                {assets}
            </head>
            <body>
            <div id="app">{children}</div>
            {scripts}
            </body>
            </html>
        )}
    />
));
