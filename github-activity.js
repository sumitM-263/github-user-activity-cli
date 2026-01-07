const https = require('https');

const username = process.argv[2];

if (!username) {
    console.log('Please provide a username.');
    process.exit(1);
}

const options = {
    hostname: 'api.github.com',
    path: `/users/${username}/events`,
    method: 'GET',
    headers: {
        'User-Agent': 'node.js-app'
    }
}

let data = '';


https.get(options, (res) => {

    const statusCode = res.statusCode;

    if (statusCode === 200) {

        res.on('error', (err) => {
            console.error("Error during data transfer:", err.message);
        });

        res.on('data', (chunk) => {
            data += chunk;
        })

        res.on('end', () => {
            const userData = JSON.parse(data);

            if (userData.length === 0) {
                console.log(`No recent activity found for user: ${username}`);
                return;
            }

            userData.forEach((event) => {

                switch (event.type) {
                    case "PushEvent":
                        console.log(`- Pushed changes to ${event.repo.name}`);
                        break;

                    case "CreateEvent":
                        console.log(`- Created a new repo - ${event.repo.name}`);
                        break;

                    case "IssuesEvent":
                        console.log(`- ${event.payload.action} an issue in ${event.repo.name}`);
                        break;

                    case "WatchEvent":
                        console.log(`- Starred ${event.repo.name}`);
                        break;

                    default:
                        console.log(`- ${event.type} in ${event.repo.name}`);
                        break;
                }
            })
        })

    } else if (statusCode === 404) {

        console.log("User not found. Please check the username.");
        res.resume();

    } else if (statusCode === 403) {

        console.log(`Failed to fetch activity. Status Code: ${res.statusCode}`);
        res.resume();
    }
}).on('error', (e) => {
    console.log(`Network Error: ${e.message}`);
})


