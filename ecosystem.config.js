module.exports = {
  apps: [
    {
      name: "chars",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // Increase body size limit
        NODE_OPTIONS: "--max-http-header-size=80000"
      },
      // Restart on file changes
      watch: false,
      // Maximum memory restart
      max_memory_restart: "1G",
      // Error log file
      error_file: "/root/.pm2/logs/chars-error.log",
      // Output log file
      out_file: "/root/.pm2/logs/chars-out.log",
      // Merge logs
      merge_logs: true,
      // Time format
      time: true,
    },
  ],
};

