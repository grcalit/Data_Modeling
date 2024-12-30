const fs = require('fs');
var LineByLineReader = require('line-by-line')

lr = new LineByLineReader('sum.csv');

let promiseArr = []

lr.on('line', async (currName) => {

    console.log("GOING")

    if (promiseArr.length > 199) {

        lr.pause();
        setTimeout(async () => {
            await Promise.all(promiseArr)
            lr.resume()
            promiseArr = []
        }, 5000);
    }

    promiseArr.push(

        new Promise(async (resolve, reject) => {

            try {

                let currFetch = await fetch("https://u.gg/api",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Origin": "https://u.gg",
                            "Referer": "https://u.gg/lol/profile/na1/" + currName + "/overview"
                        },
                        body: '{"operationName":"FetchMatchSummaries","variables":{"regionId":"na1","summonerName":"' + currName + '","queueType":[420],"duoName":"","role":[],"seasonIds":[21,20],"championId":[], "page":2},"query":"query FetchMatchSummaries($championId: [Int], $page: Int, $queueType: [Int], $duoName: String, $regionId: String!, $role: [Int], $seasonIds: [Int]!, $summonerName: String!) {\n  fetchPlayerMatchSummaries(\n    championId: $championId\n    page: $page\n    queueType: $queueType\n    duoName: $duoName\n    regionId: $regionId\n    role: $role\n    seasonIds: $seasonIds\n    summonerName: $summonerName\n  ) {\n    finishedMatchSummaries\n    totalNumMatches\n    matchSummaries {\n      assists\n      augments\n      championId\n      cs\n      damage\n      deaths\n      gold\n      items\n      jungleCs\n      killParticipation\n      kills\n      level\n      matchCreationTime\n      matchDuration\n      matchId\n      maximumKillStreak\n      primaryStyle\n      queueType\n      regionId\n      role\n      runes\n      subStyle\n      summonerName\n      summonerSpells\n      psHardCarry\n      psTeamPlay\n      lpInfo {\n        lp\n        placement\n        promoProgress\n        promoTarget\n        promotedTo {\n          tier\n          rank\n          __typename\n        }\n        __typename\n      }\n      teamA {\n        championId\n        summonerName\n        teamId\n        role\n        hardCarry\n        teamplay\n        placement\n        playerSubteamId\n        __typename\n      }\n      teamB {\n        championId\n        summonerName\n        teamId\n        role\n        hardCarry\n        teamplay\n        placement\n        playerSubteamId\n        __typename\n      }\n      version\n      visionScore\n      win\n      __typename\n    }\n    __typename\n  }\n}"}'
                    }
                )

                let parsedResults = await currFetch.json()

                if (currFetch.status !== 200) {
                    console.log("ERROR WRONG STATUSSSSS")
                }

                let matches = parsedResults.data.fetchPlayerMatchSummaries.matchSummaries

                if (matches != undefined) {

                    for (let i = 0; i < matches.length; i++) {

                        let currMatch = {
                            summoner: currName,
                            championPlayed: "",
                            champsPlayed: [],
                            didWin: "",
                            gameDuration: "",
                            otherSummoners: [],
                            matchID: ""
                        }

                        currMatch.didWin = matches[i].win
                        currMatch.championPlayed = matches[i].championId
                        currMatch.gameDuration = matches[i].matchDuration
                        currMatch.matchID = matches[i].matchId

                        for (let n = 0; n < matches[i].teamA.length; n++) {
                            currMatch.champsPlayed.push("A," + matches[i].teamA[n].championId + "," + matches[i].teamA[n].role)
                            currMatch.otherSummoners.push("A," + matches[i].teamA[n].summonerName)
                        }

                        for (let n = 0; n < matches[i].teamB.length; n++) {
                            currMatch.champsPlayed.push("B," + matches[i].teamB[n].championId + "," + matches[i].teamB[n].role)
                            currMatch.otherSummoners.push("B," + matches[i].teamB[n].summonerName)
                        }

                        fs.appendFile("./data.json", JSON.stringify(currMatch) + ",", function(err) {
                            if (err) {
                                console.log(err);
                            }
                        });
                        /*
                        fs.appendFile("./solution.csv", JSON.stringify(currMatch) + "\n", function (err) {
                            if (err) {
                                return console.log(err);
                            }
                        });
                        */
                    }
                }


                resolve("ok")
            }
            catch (error) {
                resolve("error")
            }

        })
    )


});

lr.on('end', () => {
    console.log("done")
})