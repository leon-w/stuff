function downloadAllFiles(filetype = ".pdf", numerate = true) {
    const urls = Array.from(
        new Set([...document.querySelectorAll("a")].map(a => a.href).filter(url => url.endsWith(filetype)))
    );

    if (numerate) {
        const digits = Math.ceil(Math.log10(urls.length));
        const commands = [];
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const num = i.toString().padStart(digits, "0");
            const fileName = url.split("/").pop();
            commands.push(`wget -O ${num}_${fileName} ${url}`);
        }
        return commands.join(" && ");
    } else {
        return `wget ${urls.join(" ")}`;
    }
}
