const fs = require('fs');
var LineByLineReader = require('line-by-line')

lr = new LineByLineReader('allNames.csv');

let promiseArr = []

lr.on('line', async (currName) => {

    //console.log("GOING")

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
            
            
            const uri = "https://u.gg/lol/profile/na1/" + currName + "/champion-stats"
            const encode = encodeURI(uri)
            try {
                let currFetch = await fetch("https://u.gg/api",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Origin": "https://u.gg",
                            //"Referer": "https://u.gg/lol/profile/na1/" + currName+ "/champion-stats"
                            "Referer": encode
                        },
                        body: '{"operationName":"getPlayerStats","variables":{"regionId":"na1","summonerName":"' + currName + '","queueType":[420],"role":7,"seasonId":21}, "query": "query getPlayerStats($queueType: [Int!], $regionId: String!, $role: Int!, $seasonId: Int!, $summonerName: String!) {\n  fetchPlayerStatistics(\n    queueType: $queueType\n    summonerName: $summonerName\n    regionId: $regionId\n    role: $role\n    seasonId: $seasonId\n  ) {\n    basicChampionPerformances {\n      assists\n      championId\n      cs\n      damage\n      damageTaken\n      deaths\n      doubleKills\n      gold\n      kills\n      maxDeaths\n      maxKills\n      pentaKills\n      quadraKills\n      totalMatches\n      tripleKills\n      wins\n      lpAvg\n      __typename\n    }\n    exodiaUuid\n    puuid\n    queueType\n    regionId\n    role\n    seasonId\n    __typename\n  }\n}"}'
                    }
                )

                let parsedResults = await currFetch.json()

                // console.log(JSON.stringify(parsedResults))
                

                if (currFetch.status !== 200) {
                    console.log("ERROR WRONG STATUSSSSS")
                }

                let champData = parsedResults.data.fetchPlayerStatistics[0].basicChampionPerformances
                //console.log(champData)

                if (champData != undefined) {
               
      
                    for (let i = 0; i < champData.length; i++) {

                        
                        let currChamp = {
                            summoner: currName,
                            championPlayed: champData[i].championId,
                            champAssists: champData[i].assists,
                            champKills: champData[i].kills,
                            champDeaths: champData[i].deaths,
                            totalPlayed: champData[i].totalMatches,
                            totalWon: champData[i].wins
                        }
    

                        fs.appendFile("./championData.json", JSON.stringify(currChamp)+",", function(err) {
                            if (err) {
                                console.log(err);
                            }
                        });
                   
                    }
                }


                resolve("ok")
            }
            catch (error) {
                console.log(currName)
                fs.appendFile("./badName.csv", JSON.stringify(currName)+"\n", function(err) {
                    if (err) {
                        console.log(err);
                    }
                })
                resolve("error")
            }

        })
    )


});

lr.on('end', () => {
    console.log("done")
})