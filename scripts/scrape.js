
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Usage: node scripts/scrape.js [URL]
const targetUrl = process.argv[2];

if (!targetUrl) {
    console.error("❌ Please provide a URL.");
    console.error("Usage: node scripts/scrape.js https://everytime.kr/@...");
    process.exit(1);
}

(async () => {
    console.log(`🌐 Launching browser to scrape: ${targetUrl}`);

    const browser = await puppeteer.launch({
        headless: false, // Show the browser
        defaultViewport: null,
        args: ['--start-maximized']
    });
    const page = await browser.newPage();

    try {
        console.log("⏳ Navigating to URL...");
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log("⏳ Waiting for table selector...");
        // Increase timeout
        await page.waitForSelector('table.timetable', { timeout: 30000 });

        console.log("👀 Found timetable! Analyzing structure...");

        // Extract data
        const courses = await page.evaluate(() => {
            const table = document.querySelector('table.timetable');
            if (!table) return [];

            const results = [];
            const dayCols = table.querySelectorAll('tbody tr td'); // These are the day columns

            // Everytime structure:
            // <table>
            //   <thead>...</thead> (Time labels)
            //   <tbody>
            //     <tr>
            //       <td> (Monday Wrapper)
            //          <div class="cols" style="width: 94px;"> ... </div> (Grid lines)
            //          <div class="cols" style="width: 94px;">
            //             <div class="subject height-X top-Y color-Z"> ... </div>
            //          </div>
            //       </td>
            //       <td> (Tuesday Wrapper) ... </td>
            //     </tr>
            //   </tbody>
            // </table>

            // But wait, the Velog article says pixel parsing. 
            // Let's look at the actual Everytime structure via the DOM we can see.
            // Actually simplest is to iterate over `.subject` elements if they are nested under days, 
            // OR find all `.subject` and calculate their day based on parent index.

            // Let's assume standard grid:
            // .timetable > tbody > tr > td (Each td is a day)
            // Inside td: .cols > .subject

            const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            const dayNodes = Array.from(document.querySelectorAll('table.timetable tbody tr td'));

            dayNodes.forEach((td, dayIndex) => {
                const subjects = td.querySelectorAll('.subject');
                subjects.forEach(sub => {
                    const name = sub.querySelector('h3')?.innerText || "Unknown";
                    const professor = sub.querySelector('p')?.innerText || "";

                    // Parse Time from Style (Top/Height)
                    // Assuming standard: 1 hour = around 50px or 60px?
                    // Everytime Web: 09:00 starts at top 0? No, usually some offset.
                    // But wait, we can just map simple top/height to relative slots.
                    // Standard Everytime: 
                    // Each hour is 60px height. 
                    // Start time is usually 08:00 or 09:00 depending on settings. 
                    // But for "Shared" URL, it might be fixed.

                    // Let's grab the style strings
                    const style = window.getComputedStyle(sub);
                    const topStr = style.top; // e.g. "120px"
                    const heightStr = style.height; // e.g. "60px"

                    const top = parseFloat(topStr);
                    const height = parseFloat(heightStr);

                    // Heuristic:
                    // 0px top -> 09:00 (Usually standard start)
                    // 60px -> 1 hour
                    // So (top / 60) + 9 = StartHour
                    // This might need calibration, but let's try.

                    // Note: Everytime sometimes sends 08:00 start if there are early classes.
                    // But typically the shared timetable starts from 0 (matches 0th index of time labels).
                    // Let's look at the time labels to be sure?
                    // For now, let's just store the raw pixels and normalize later, or strict guess.

                    // Let's assume 12 slots (9 to 6+).
                    // 5 minute quantum.

                    // For this MVP, let's just create a "Raw Scraped" object.
                    results.push({
                        day: days[dayIndex % 7], // in case index > 6
                        name,
                        professor,
                        top,
                        height,
                        id: Math.random().toString(36).substr(2, 9)
                    });
                });
            });

            return results;
        });

        console.log(`✅ Extracted ${courses.length} courses.`);

        // Save to file
        const outputPath = path.resolve(process.cwd(), 'src/data/scrapedCourses.json');
        fs.writeFileSync(outputPath, JSON.stringify(courses, null, 2));

        console.log(`💾 Saved to ${outputPath}`);
        console.log("👉 Now running the app will use this data!");

    } catch (error) {
        console.error("💥 Error scraping:", error);
    } finally {
        await browser.close();
    }
})();
