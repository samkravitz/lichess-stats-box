#!/usr/bin/env node

require('dotenv').config()
const axios = require('axios')

const { gistId, githubToken, lichessUsername } = process.env

async function main()
{
    const stats = await axios.get(`https://lichess.org/api/user/${lichessUsername}`)
    const gistContent = 
    [
        ['⭐', 'Bullet', stats.data.perfs.bullet.rating],
        ['⭐', 'Blitz', stats.data.perfs.blitz.rating],
        ['⭐', 'Rapid', stats.data.perfs.rapid.rating],
        ['⭐', 'Classical', stats.data.perfs.classical.rating],
    ]
        .map((content) => {
            let line = `${content[1]}:${content[2]}`
            line = line.replace(':', ':' + ' '.repeat(45 - line.length))
            line = `${content[0]}    ${line}`
            return line
        })
        .join('\n') + '\n'
    
    const gist = await axios.get(`https://api.github.com/gists/${gistId}`, {
        headers: {
            authorization: `token ${githubToken}`
        },
    });
    const filename = Object.keys(gist.data.files)[0]

    if (gist.data.files[filename].content === gistContent) {
        console.info('Nothing to update')
        return
    }

    return axios.patch(`https://api.github.com/gists/${gistId}`, {
        files: {
            [filename]: {
                filename: `${lichessUsername}'s Lichess Stats`,
                description: 'lichess.org stats',
                content: gistContent,
            },
        },
    }, {
        headers: {
            authorization: `token ${githubToken}`
        },
    }).then(() => {
        console.info(`Updated Gist ${gistId} with the following content:\n${gistContent}`)
    })
}

main()
    .catch(err => console.error(err))