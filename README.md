# hello-world

Hello World tutorial for GitHub.

My name is Tim Scheibe. I am a research scientist at Pacific Northwest National Laboratory, where I lead large projects that involve software development. I am not a software developer, but I want to understand how to use tools like GitHub and Codex in practical ways.

## Simple learning app

This workspace now includes a tiny browser app you can use to practice:

- index.html — the main page
- app.js — a small interactive script
- styles.css — simple styling

### How to run it

Option 1: open index.html directly in your browser.

Option 2: from this folder, run:

python -m http.server 8000

Then open http://localhost:8000/ in your browser.

### How to use this for learning

1. Make a small change to the text or style.
2. Save the file.
3. Refresh the browser to see the result.
4. Commit the change in GitHub and practice the basic workflow.

This is intentionally simple so you can focus on the GitHub and Codex workflow instead of complex code.

## Repeating the PDM data update process

For regular updates, the simplest repeatable approach is to run the helper script instead of editing `PDM_Data.txt` by hand. The script validates the date and numeric values, updates an existing date if you rerun it, keeps the data sorted, and writes the row in the format the chart already reads.

Example:

```bash
python scripts/add_pdm_entry.py 2026-06-05 0.6720 0.7010
```

Then commit and push the updated data file:

```bash
git status
git add PDM_Data.txt
git commit -m "Update PDM data"
git push
```

This is a good first automation because it stays transparent: you can run it whenever you have new data, inspect the file before committing, and still use the normal GitHub workflow. If the data eventually comes from a spreadsheet, database, or API, the same script can be extended to read from that source and can also be scheduled with a cron job, Windows Task Scheduler, or GitHub Actions.
