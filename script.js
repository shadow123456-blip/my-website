/* =========================================
   CHAMPIONS LEAGUE TABLE JAVASCRIPT
========================================= */


/* =========================================
   VARIABLES
========================================= */

const tableBody = document.getElementById("tableBody");

const homeTeam = document.getElementById("homeTeam");
const awayTeam = document.getElementById("awayTeam");

const homeScore = document.getElementById("homeScore");
const awayScore = document.getElementById("awayScore");

const matchDate = document.getElementById("matchDate");

const addResultBtn = document.getElementById("addResultBtn");

const resultsContainer = document.getElementById("resultsContainer");


/*
    Store all match results here.

    Example:

    {
        home: "Arsenal",
        away: "Barcelona",
        homeScore: 2,
        awayScore: 1,
        date: "2026-09-27"
    }
*/

let results = JSON.parse(localStorage.getItem("championsLeagueResults")) || [];


/* =========================================
   GET ALL TEAMS
========================================= */

function getTeams() {

    const rows = document.querySelectorAll("#tableBody tr");

    const teams = [];

    rows.forEach((row, index) => {

        const nameInput = row.querySelector(".club-name");

        teams.push({
            id: index,
            name: nameInput.value.trim() || `Club ${index + 1}`
        });

    });

    return teams;
}


/* =========================================
   SAVE TEAM NAMES
========================================= */

function saveTeamNames() {

    const rows = document.querySelectorAll("#tableBody tr");

    const names = [];

    rows.forEach((row, index) => {

        const input = row.querySelector(".club-name");

        names.push(
            input.value.trim() || `Club ${index + 1}`
        );

    });

    localStorage.setItem(
        "championsLeagueTeamNames",
        JSON.stringify(names)
    );
}


/* =========================================
   LOAD TEAM NAMES
========================================= */

function loadTeamNames() {

    const savedNames =
        JSON.parse(
            localStorage.getItem("championsLeagueTeamNames")
        );

    if (!savedNames) {
        return;
    }

    const rows = document.querySelectorAll("#tableBody tr");

    rows.forEach((row, index) => {

        const input = row.querySelector(".club-name");

        if (savedNames[index]) {
            input.value = savedNames[index];
        }

    });

}


/* =========================================
   UPDATE TEAM DROPDOWNS
========================================= */

function updateTeamDropdowns() {

    const teams = getTeams();

    const currentHome = homeTeam.value;
    const currentAway = awayTeam.value;

    homeTeam.innerHTML =
        `<option value="">Select team</option>`;

    awayTeam.innerHTML =
        `<option value="">Select team</option>`;


    teams.forEach(team => {

        const homeOption = document.createElement("option");

        homeOption.value = team.id;

        homeOption.textContent = team.name;

        homeTeam.appendChild(homeOption);


        const awayOption = document.createElement("option");

        awayOption.value = team.id;

        awayOption.textContent = team.name;

        awayTeam.appendChild(awayOption);

    });


    /*
        Restore previous selections
        if they still exist.
    */

    if (
        [...homeTeam.options]
            .some(option => option.value === currentHome)
    ) {

        homeTeam.value = currentHome;

    }


    if (
        [...awayTeam.options]
            .some(option => option.value === currentAway)
    ) {

        awayTeam.value = currentAway;

    }

}


/* =========================================
   GET TEAM NAME FROM ID
========================================= */

function getTeamName(teamId) {

    const teams = getTeams();

    const team = teams.find(
        team => team.id === Number(teamId)
    );

    return team ? team.name : "Unknown Team";

}


/* =========================================
   CREATE TEAM STATISTICS
========================================= */

function createTeamStats() {

    const teams = getTeams();

    const stats = {};

    teams.forEach(team => {

        stats[team.id] = {

            id: team.id,

            name: team.name,

            played: 0,

            wins: 0,

            draws: 0,

            losses: 0,

            goalsFor: 0,

            goalsAgainst: 0,

            goalDifference: 0,

            points: 0

        };

    });

    return stats;

}


/* =========================================
   CALCULATE TABLE
========================================= */

function calculateTable() {

    const stats = createTeamStats();


    /*
        Go through every match
        and update the teams.
    */

    results.forEach(match => {

        const home = stats[match.home];

        const away = stats[match.away];


        /*
            Make sure both teams exist.
        */

        if (!home || !away) {
            return;
        }


        /* Games played */

        home.played++;

        away.played++;


        /* Goals */

        home.goalsFor += match.homeScore;

        home.goalsAgainst += match.awayScore;

        away.goalsFor += match.awayScore;

        away.goalsAgainst += match.homeScore;


        /*
            Home team wins
        */

        if (match.homeScore > match.awayScore) {

            home.wins++;

            home.points += 3;

            away.losses++;

        }


        /*
            Away team wins
        */

        else if (match.homeScore < match.awayScore) {

            away.wins++;

            away.points += 3;

            home.losses++;

        }


        /*
            Draw
        */

        else {

            home.draws++;

            away.draws++;

            home.points++;

            away.points++;

        }

    });


    /*
        Calculate goal difference.
    */

    Object.values(stats).forEach(team => {

        team.goalDifference =
            team.goalsFor - team.goalsAgainst;

    });


    /*
        Convert object into array.
    */

    const table = Object.values(stats);


    /*
        Sort according to league-table rules:

        1. Points
        2. Goal difference
        3. Goals scored
        4. Club name
    */

    table.sort((a, b) => {

        if (b.points !== a.points) {
            return b.points - a.points;
        }

        if (
            b.goalDifference !==
            a.goalDifference
        ) {

            return (
                b.goalDifference -
                a.goalDifference
            );

        }

        if (b.goalsFor !== a.goalsFor) {
            return b.goalsFor - a.goalsFor;
        }

        return a.name.localeCompare(b.name);

    });


    return table;

}


/* =========================================
   DISPLAY TABLE
========================================= */

function displayTable() {

    const table = calculateTable();


    /*
        Clear existing rows.
    */

    tableBody.innerHTML = "";


    table.forEach((team, index) => {

        const row = document.createElement("tr");


        /*
            Position
        */

        const positionCell =
            document.createElement("td");

        positionCell.className = "position";

        positionCell.textContent = index + 1;


        /*
            Club
        */

        const clubCell =
            document.createElement("td");

        clubCell.className = "club";


        const clubInput =
            document.createElement("input");

        clubInput.type = "text";

        clubInput.className = "club-name";

        clubInput.value = team.name;

        clubInput.addEventListener(
            "change",
            function () {

                renameTeam(
                    team.id,
                    this.value
                );

            }
        );


        clubCell.appendChild(clubInput);


        /*
            Statistics
        */

        const playedCell =
            document.createElement("td");

        playedCell.className = "played";

        playedCell.textContent = team.played;


        const winsCell =
            document.createElement("td");

        winsCell.className = "wins";

        winsCell.textContent = team.wins;


        const drawsCell =
            document.createElement("td");

        drawsCell.className = "draws";

        drawsCell.textContent = team.draws;


        const lossesCell =
            document.createElement("td");

        lossesCell.className = "losses";

        lossesCell.textContent = team.losses;


        const goalsForCell =
            document.createElement("td");

        goalsForCell.className = "goals-for";

        goalsForCell.textContent =
            team.goalsFor;


        const goalsAgainstCell =
            document.createElement("td");

        goalsAgainstCell.className =
            "goals-against";

        goalsAgainstCell.textContent =
            team.goalsAgainst;


        const goalDifferenceCell =
            document.createElement("td");

        goalDifferenceCell.className =
            "goal-difference";

        goalDifferenceCell.textContent =
            team.goalDifference > 0
                ? `+${team.goalDifference}`
                : team.goalDifference;


        const pointsCell =
            document.createElement("td");

        pointsCell.className = "points";

        pointsCell.textContent =
            team.points;


        /*
            Add cells to row.
        */

        row.appendChild(positionCell);

        row.appendChild(clubCell);

        row.appendChild(playedCell);

        row.appendChild(winsCell);

        row.appendChild(drawsCell);

        row.appendChild(lossesCell);

        row.appendChild(goalsForCell);

        row.appendChild(goalsAgainstCell);

        row.appendChild(goalDifferenceCell);

        row.appendChild(pointsCell);


        /*
            Add row to table.
        */

        tableBody.appendChild(row);

    });


    /*
        Update dropdowns after
        table has been rebuilt.
    */

    updateTeamDropdowns();

}


/* =========================================
   RENAME TEAM
========================================= */

function renameTeam(teamId, newName) {

    newName = newName.trim();


    /*
        Don't allow an empty name.
    */

    if (newName === "") {

        alert("Please enter a club name.");

        displayTable();

        return;

    }


    const names =
        JSON.parse(
            localStorage.getItem(
                "championsLeagueTeamNames"
            )
        ) || [];


    names[teamId] = newName;


    localStorage.setItem(
        "championsLeagueTeamNames",
        JSON.stringify(names)
    );


    /*
        Update dropdowns.
    */

    updateTeamDropdowns();


    /*
        Recalculate table.
    */

    displayTable();

}


/* =========================================
   ADD MATCH RESULT
========================================= */

function addResult() {

    const home = homeTeam.value;

    const away = awayTeam.value;

    const homeGoals =
        parseInt(homeScore.value);

    const awayGoals =
        parseInt(awayScore.value);

    const date = matchDate.value;


    /*
        Check teams.
    */

    if (home === "" || away === "") {

        alert(
            "Please select both teams."
        );

        return;

    }


    /*
        Prevent team playing itself.
    */

    if (home === away) {

        alert(
            "A club cannot play against itself."
        );

        return;

    }


    /*
        Check scores.
    */

    if (
        isNaN(homeGoals) ||
        isNaN(awayGoals) ||
        homeGoals < 0 ||
        awayGoals < 0
    ) {

        alert(
            "Please enter valid match scores."
        );

        return;

    }


    /*
        Date is optional.

        If the user doesn't select
        a date, use today's date.
    */

    let resultDate = date;

    if (!resultDate) {

        const today =
            new Date();

        resultDate =
            today.toISOString()
                .split("T")[0];

    }


    /*
        Create match object.
    */

    const match = {

        home: Number(home),

        away: Number(away),

        homeScore: homeGoals,

        awayScore: awayGoals,

        date: resultDate

    };


    /*
        Add result to array.
    */

    results.push(match);


    /*
        Save results.
    */

    saveResults();


    /*
        Update everything.
    */

    displayTable();

    displayResults();


    /*
        Reset form.
    */

    homeTeam.value = "";

    awayTeam.value = "";

    homeScore.value = 0;

    awayScore.value = 0;

    matchDate.value = "";

}


/* =========================================
   SAVE RESULTS
========================================= */

function saveResults() {

    localStorage.setItem(
        "championsLeagueResults",
        JSON.stringify(results)
    );

}


/* =========================================
   DISPLAY RESULTS
========================================= */

function displayResults() {

    resultsContainer.innerHTML = "";


    /*
        No results
    */

    if (results.length === 0) {

        const message =
            document.createElement("p");

        message.className = "no-results";

        message.textContent =
            "No match results have been added yet.";

        resultsContainer.appendChild(message);

        return;

    }


    /*
        Display newest results first.
    */

    results.forEach((match, index) => {

        const card =
            document.createElement("div");

        card.className = "result-card";


        /*
            Date
        */

        const date =
            document.createElement("div");

        date.className = "result-date";

        date.textContent =
            formatDate(match.date);


        /*
            Home team
        */

        const home =
            document.createElement("div");

        home.className =
            "result-team home";

        home.textContent =
            getTeamName(match.home);


        /*
            Score
        */

        const score =
            document.createElement("div");

        score.className =
            "result-score";

        score.textContent =
            `${match.homeScore} - ${match.awayScore}`;


        /*
            Away team
        */

        const away =
            document.createElement("div");

        away.className =
            "result-team";

        away.textContent =
            getTeamName(match.away);


        /*
            Delete button
        */

        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "delete-result";

        deleteButton.textContent =
            "Delete";


        deleteButton.addEventListener(
            "click",
            function () {

                deleteResult(index);

            }
        );


        /*
            Add elements to card.
        */

        card.appendChild(date);

        card.appendChild(home);

        card.appendChild(score);

        card.appendChild(away);

        card.appendChild(deleteButton);


        resultsContainer.appendChild(card);

    });

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================
   DELETE RESULT
========================================= */

function deleteResult(index) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this result?"
        );


    if (!confirmed) {
        return;
    }


    /*
        Remove result.
    */

    results.splice(index, 1);


    /*
        Save new results.
    */

    saveResults();


    /*
        Update table and results.
    */

    displayTable();

    displayResults();

}


/* =========================================
   TEAM NAME CHANGE DETECTION
========================================= */

function setupTeamNameListeners() {

    const inputs =
        document.querySelectorAll(
            ".club-name"
        );


    inputs.forEach((input, index) => {

        input.addEventListener(
            "change",
            function () {

                renameTeam(
                    index,
                    this.value
                );

            }
        );

    });

}


/* =========================================
   EVENT LISTENERS
========================================= */

addResultBtn.addEventListener(
    "click",
    addResult
);


/* =========================================
   ENTER KEY SUPPORT
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            document.activeElement.tagName !== "INPUT"
        ) {

            addResult();

        }

    }
);


/* =========================================
   INITIALIZE WEBSITE
========================================= */

function initialize() {

    /*
        Load saved club names.
    */

    loadTeamNames();


    /*
        Set up editable team names.
    */

    setupTeamNameListeners();


    /*
        Create team dropdowns.
    */

    updateTeamDropdowns();


    /*
        Calculate and display table.
    */

    displayTable();


    /*
        Display saved results.
    */

    displayResults();

}


/*
    Start application.
*/

initialize();
