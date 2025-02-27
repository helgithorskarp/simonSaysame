const padIdColors = { 
    'pad-red': 'red',
    'pad-blue': 'blue',
    'pad-green': 'green',
    'pad-yellow': 'yellow'
  }
  
  let canClickPads = false; // flag for pad clicks
  let canReplay = false; // flag for replay btn
  let gameSequence;
  
  const putReq = async () => {
    let response;
    const url = "http://localhost:3000/api/v1/game-state";
    try {
      response = await axios.put(url); // get game info
      document.getElementById("high-score").innerHTML = response.data.gameState.highScore;
      gameSequence = response.data.gameState.sequence;
    } catch (error) {
      console.log(error); 
    }
  
    document.getElementById("start-btn").addEventListener('click', () => {
      addPadEventListeners(response.data.gameState.sequence)
      addReplayEventListeners(response.data.gameState.sequence)
      document.getElementById("start-btn").disabled = true;
      playSeq(response.data.gameState.sequence);
    }, { once: true });
  }
  
  const postReq = async (userSequence) => {
    let response;
    const url = "http://localhost:3000/api/v1/game-state/sequence";
    try {
      response = await axios.post(url, { sequence: userSequence }); // send latest user seq
      userSequence.length = 0; // reset user seq
      gameSequence = response.data.gameState.sequence;
      document.getElementById("high-score").innerHTML = response.data.gameState.highScore;
      document.getElementById("level-indicator").innerHTML = response.data.gameState.level; 
      playSeq(response.data.gameState.sequence);
    } catch (error) { 
      userSequence.length = 0; 
      gameSequence = error.response.data.gameState.sequence;
      document.getElementById("start-btn").addEventListener("click", () => { 
        document.getElementById("start-btn").disabled = true; 
        playSeq(error.response.data.gameState.sequence);
      }, { once: true });
    }
  }
  

  const playSeq = (sequence) => 
    {
    const padColors = {
      red: 'pad-red',
      blue: 'pad-blue',
      green: 'pad-green',
      yellow: 'pad-yellow'
    };
  
    canClickPads = false;
    canReplay = false;
    document.getElementById("replay-btn").disabled = true;
    
    sequence.forEach((color, i) => {
      setTimeout(() => {
        activateBtn(padColors[color]);
      }, 900 * i);
    });
    

    setTimeout(() => {
       canClickPads = true;
       canReplay = true;
      document.getElementById("replay-btn").disabled = false;
    }, 900 * sequence.length); // with the time out here im trying to make it so that each pad plays not on the same time
  }
  
  const activateBtn = (buttonID) => {
    const button = document.getElementById(buttonID);
    playNote(padIdColors[buttonID]);
    button.classList.add('active'); // basically adding a activate to button then removeing after 5 sek
    setTimeout(() => {
    button.classList.remove('active');
    }, 500);
  }
  
  const addReplayEventListeners = () => {
    document.getElementById('replay-btn').addEventListener('click', () => {
      if (!canReplay) return;
      playSeq(gameSequence);
    })
  }
  
  const addPadEventListeners = () => {
    let padsHTMLCollection = document.getElementsByClassName('pad');
    let padsArray = Array.from(padsHTMLCollection);
    
    let userSequence = [];
  
    document.addEventListener("keydown", (e) => { 
      if (!canClickPads) return; 
      let padId;
      let key = e.key.toLowerCase();
    
      if (key === 'q') {
        padId = 'pad-red';
      } else if (key === 'w') {
        padId = 'pad-yellow';
      } else if (key === 'a') {
        padId = 'pad-green';
      } else if (key === 's') {
        padId = 'pad-blue';
      } else {
        return;
      }
      document.getElementById("replay-btn").disabled = true;
      canReplay = false;
      handleClick(userSequence, gameSequence, padId);
    });
  
    padsArray.forEach((pad) => { 
    pad.addEventListener('click', function () {
        if (!canClickPads) return;
        document.getElementById("replay-btn").disabled = true;
        canReplay = false;
        handleClick(userSequence, gameSequence, pad.id);
      });
    });
  }
  
  const handleClick = (userSequence, sequence, padId) => {
    activateBtn(padId);
    userSequence.push(padIdColors[padId]);
  
    if (userSequence.length === sequence.length) {
    let level = parseInt(document.getElementById("level-indicator").innerHTML);
  
      if (areArraysEqual(sequence, userSequence)) {
        document.getElementById("level-indicator").innerHTML = level + 1;
        canClickPads = false;
        setTimeout(() => postReq(userSequence), 3000); // here im setting a bit of delay before next game start
      } else {
        document.getElementById("level-indicator").innerHTML = 1;
        canClickPads = false;
        showFailureModal();
        postReq(userSequence);
      }
    }
  }
  

  const showFailureModal = () => {
    document.querySelector('.modal').style.display = 'block';
document.getElementById("start-btn").disabled = false;
    document.getElementById("reset-btn").addEventListener('click', () => {
      document.querySelector('.modal').style.display = 'none';
    }, { once: true });
  };
  
  const areArraysEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
  let isEqual = true;
    arr1.forEach((item, i) => {
      if (item !== arr2[i]) isEqual = false;
    });
    return isEqual;};
  
  const playNote = (color) => 
    {   
    // here we basically get the name of the sounf user picked
    let soundOption = document.getElementById("sound-select").value;
    const synth = new Tone.Synth({ oscillator: { type: soundOption } }).toDestination();

    //and here we then play that sounf
    const now = Tone.now();
    if (color === "red") {
      synth.triggerAttackRelease("C4", "4n", now);}
       else if (color === "yellow") {
      synth.triggerAttackRelease("D4", "4n", now);
    } else if (color === "green") {
    synth.triggerAttackRelease("E4", "4n", now);
    } else if (color === "blue") {
      synth.triggerAttackRelease("F4", "4n", now);}
  };
  
  putReq();
