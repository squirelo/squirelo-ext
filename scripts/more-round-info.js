(async function() {
    const URL_BASE = `https://www.geoguessr.com/api/v3`;
    const game_id = window.location.href.split('/').pop();

    let response = await fetch(`${URL_BASE}/games/${game_id}`);
    const game_info = await response.json();

    /**
     * Right now, don't inject this into streak games.
     */
    if (game_info.mode !== 'standard') {
        return;
    }

    response = await fetch(`https://www.geoguessr.com/api/v3/profiles/`);
    const profile_info = await response.json();

    function parse_round_info(guess) {
        let score = parseInt(guess.roundScore.amount).toLocaleString('en-US');

        let distance = profile_info.distanceUnit === 0 ?
            `${guess.distance.meters.amount} ${guess.distance.meters.unit}` :
            `${guess.distance.miles.amount} ${guess.distance.miles.unit}`

        let round_seconds_date = new Date(0), time;
        round_seconds_date.setSeconds(guess.time);

        if (guess.time < 60) {
            time = `${guess.time}s`;
        } else if (guess.time >= 60 && guess.time < 3600) {
            time = `${round_seconds_date.toISOString().substr(14, 5).replace(/^0+/, '')}`;
        } else {
            time = `${round_seconds_date.toISOString().substr(11, 8).replace(/^0+/, '')}`;
        }

        return { score, distance, time };
    }

    const layout_elem = document.querySelector('div.game-layout__status');

    /**
     * Style default game statuses.
     */
    layout_elem.firstElementChild.style = `display: flex; white-space: nowrap; border-bottom-left-radius: 0; border-bottom-right-radius: 0;`;
    document.querySelectorAll('div.game-status').forEach(status => {
        status.style = `flex: 1;`;
    });

    const get_score = async function () {
        const scoreVisible = document.querySelector("[class^='result-layout_root']");
        console.log(scoreVisible); 
        if (scoreVisible) {
          const URL_BASE = `https://www.geoguessr.com/api/v3`;
          const game_id = window.location.href.split('/').pop();
    
          let responseBis = await fetch(`${URL_BASE}/games/${game_id}`);
          const infos = await responseBis.json();
            console.log('bla');
          if (infos.player.guesses) {
            console.log('blabla');
            const points = infos.player.guesses[infos.player.guesses.length - 1].roundScore;
            const url = chrome.runtime.getURL('test.txt');
            // version fichier texte
            fetch(url)
              .then((response) => response.text()) //assuming file contains json
              .then((scoreToReach) => {
                console.log(scoreToReach, parseInt(points.amount, 10));
                if (parseInt(points.amount, 10) < scoreToReach) {
                  console.log("fire");
                }
              });
            
            // Version config extension
            chrome.storage.sync.get('score-value', res => {
              const scoreToReach = parseInt(res['score-value'], 10);
              console.log(scoreToReach, parseInt(points.amount, 10));
              if (parseInt(points.amount, 10) < scoreToReach) {
                console.log("fire");
              }
            });
          }
        }
      };
    /**
     * Listen for game score change and request the game state.
     */
    let observer = new MutationObserver(async _mutations => {
        const response = await fetch(`${URL_BASE}/games/${game_id}`);
        const game_info = await response.json();

        console.log('infos', game_info);
        get_score();

        const guess = parse_round_info(game_info.player.guesses[game_info.round - 2]);
        const round_elem = document.querySelector(`div#round${game_info.round - 1}-details`);

        const round = game_info.rounds[game_info.round - 2];
        const coords = { lat: round.lat, lng: round.lng };

        round_elem.children[1].href = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
        round_elem.children[1].firstElementChild.innerHTML = guess.score;
        round_elem.children[2].innerHTML = `${guess.distance} | ${guess.time}`
    });
    observer.observe(document.querySelector("[class^='version3-in-game_layout']"), {
        subtree: true,
        characterData: true,
    });

    // //const statuses_elem = document.createElement('div');
    // statuses_elem.innerHTML = `
    //     <div class="game-statuses" id="advanced-round-statuses"
    //         style="display: flex; border-top-left-radius: 0; border-top-right-radius: 0;"
    //     >
    //     </div>`.trim();

    // for (let i = 1; i <= 4; i++) {
    //     const round_info = document.createElement('div');

    //     const guess_dict = game_info.player.guesses[i-1];
    //     const guess = guess_dict ? parse_round_info(guess_dict) : undefined;

    //     const coords = guess ? { lat: game_info.rounds[i-1].lat, lng: game_info.rounds[i-1].lng } : undefined;

    //     round_info.innerHTML = `
    //         <div class="game-status" id="round${i}-details" data-qa="score"
    //             style="flex: 1; white-space: nowrap;">
    //             <div class="game-status__heading">
    //                 Round ${i}
    //             </div>
    //             <a target="_blank" href="${guess ?
    //                 `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}` : '' }"
    //                 style="text-decoration: none;">
    //                 <div class="game-status__body score-label">
    //                     ${guess ? guess.score : '-'}
    //                 </div>
    //             </a>
    //             <div class="extra-label" style="font-size: 8px;">
    //                 ${guess ? `${guess.distance} | ${guess.time}` : 'TBD'}
    //             </div>
    //         </div>
    //     `.trim();

    //     statuses_elem.firstChild.appendChild(round_info.firstChild);
    // }
    // layout_elem.appendChild(statuses_elem.firstChild);
})();
