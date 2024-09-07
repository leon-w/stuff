import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const OptionsPage: React.FC = () => {
    const [urlPatterns, setUrlPatterns] = useState<string>("");

    useEffect(() => {
        // Load URL patterns from Chrome local storage when the component mounts
        chrome.storage.local.get(["urlPatterns"], result => {
            if (result.urlPatterns) {
                setUrlPatterns(result.urlPatterns);
            }
        });
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newUrlPatterns = event.target.value;
        setUrlPatterns(newUrlPatterns);
        // Save URL patterns to Chrome local storage
        chrome.storage.local.set({ urlPatterns: newUrlPatterns }).then(() => {
            chrome.runtime.sendMessage({ type: "blocklist_update" });
        });
    };

    return (
        <>
            <AppBar position="sticky" color="default" elevation={1}>
                <Toolbar>
                    <Typography variant="h6" align="center" noWrap>
                        Site Blocker Options
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mt: 4 }}>
                    Block URLs
                </Typography>
                <Typography>
                    Enter URL patterns to block. Use a hashtag (#) at the beginning of a line to comment out a pattern.
                </Typography>
                <TextField
                    label="URL Patterns"
                    placeholder="Enter URL patterns, one per line. Use # to comment out."
                    multiline
                    fullWidth
                    rows={10}
                    variant="outlined"
                    value={urlPatterns}
                    onChange={handleInputChange}
                    sx={{ mt: 1 }}
                />
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                    <Link href="https://github.com/leon-w/stuff">site-blocker</Link>
                </Typography>
            </Container>
        </>
    );
};

ReactDOM.render(
    <React.StrictMode>
        <CssBaseline />
        <OptionsPage />
    </React.StrictMode>,
    document.getElementById("root")
);
