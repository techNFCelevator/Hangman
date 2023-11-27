const abortGameBtn=document.querySelector("header>button");
const animationSpeed=1000;
const answerKeysFilepath="json/answers.json";
const borderSize=2;
const gameArea=document.querySelector("main");
const graphicDisplay=document.getElementById("wrong_answers");
const graphicKeyboard=document.querySelectorAll("#keyboard>button");
const hintDisplay=document.getElementById("hint");
const invalidLetters=[];
const letterConditions=/[a-z]/i;
const letterRegEx=RegExp(letterConditions);
const maxAttempts=6;
const otherCharConditions=/[^a-z]/i;
const otherCharRegEx=RegExp(otherCharConditions);
const popup=document.createElement("section");
const popupBorderColor="forestgreen";
const popupPadding="2px";
const startupError=`<h2>Sorry!</h2><p>Game is not functional due to unable to obtain any valid answer key</p>`;
const startupErrorBackgroundColor="red";
const startupErrorBorderColor="darkred";
const startupErrorTextColor="azure"
const textDisplay=document.getElementById("correct_letters");
const validLetters=[];
let answer="";
let answers=[];
let expectedLetters=[];
let hint="";
popup.className="popup";
gameArea.prepend(popup);
$(`.popup`).css({"background-color":"yellow","border":`solid ${borderSize}px ${popupBorderColor}`,"border-radius":`${borderSize*2}px`,"display":"flex","flex-direction":"column","justify-content":"center","left":"50%","position":"absolute","text-align":"center","top":"50%","transform":"translate(-50%,-50%)"}).hide();
fetch(answerKeysFilepath).then(
    function(response){
        if(response.ok){
            return response.json();
        }else{
            console.log(`Cannot fetch "${answerKeysFilepath}" because response is ${response.ok}.`)
        }
    }
).then(
    function(data){
        answers=data;
        for(let key=0;key<answers.length;){
            if(Object.hasOwn(answers[key],"answer")&&typeof answers[key].answer==="string"&&answers[key].answer.length>0&&letterRegEx.test(answers[key].answer)){
                ++key;
            }else{
                answers.splice(key,1);
            }
        }
        if(answers.length>0){
            $(`.popup`).html(`<h2>Welcome!</h2><p>Up for a challenge?</p><button>Begin</button>`);
            $(`.popup button`).on("click",startGame).css({"border-radius":`${borderSize}px`,"margin":"initial"});
        }else{
            $(`.popup`).html(startupError).css({"background-color":startupErrorBackgroundColor,"border-color":startupErrorBorderColor,"color":startupErrorTextColor});
        }
        $(`.popup h2,.popup p`).css("padding",popupPadding);
        $(`.popup`).fadeIn(animationSpeed);
    }
).catch(
    function(error){
        $(`.popup`).html(startupError).fadeIn(animationSpeed).css({"background-color":startupErrorBackgroundColor,"border-color":startupErrorBorderColor,"color":startupErrorTextColor});
        $(`.popup h2,.popup p`).css("padding",popupPadding);
        console.log(error);
    }
);
abortGameBtn.addEventListener("click",function(){
    endGame(validLetters.length>=expectedLetters.length);
    $(`.popup h2`).text("Sorry for the trouble...");
    $(`.popup p`).text("Attempt another challenge?");
    $(`.popup button`).text("Restart");
});
abortGameBtn.setAttribute("disabled",true);
document.addEventListener("keydown",event=>{
    graphicKeyboard.forEach(btn=>{
        if(event.key.toLowerCase()==btn.value&&btn.getAttribute("disabled")===null){
            processLetter(btn.value);
            btn.setAttribute("disabled",true);
        }
    });
});
graphicKeyboard.forEach(btn=>{
    btn.addEventListener("click",function(){
        processLetter(btn.value);
        btn.setAttribute("disabled",true);
    });
    btn.setAttribute("disabled",true);
});
function endGame(isWon){
    const revealed=textDisplay.textContent.split('');
    for (let i=0,arraySize=invalidLetters.length;i<arraySize;++i) {
        invalidLetters.pop();
    }
    for(let i=0,arraySize=validLetters.length;i<arraySize;++i){
        validLetters.pop();
    }
    for(let position=0;position<answer.length;++position){
        if(revealed[position]==='_'){
            revealed[position]=answer[position];
        }
    }
    if(isWon){
        $(`.popup h2`).text("You guessed correctly!");
        $(`.popup p`).text("Up for another challenge?");
        $(`.popup button`).text("Play again");
        $(`.popup`).css("border-color",popupBorderColor).fadeIn(animationSpeed);
    }else{
        $(`.popup h2`).text("Oops, you lost...");
        $(`.popup p`).text("Want to do another challenge?");
        $(`.popup button`).text("Play again");
        $(`.popup`).css("border-color","orangered").delay(3000).fadeIn(animationSpeed);
    }
    abortGameBtn.setAttribute("disabled",true);
    answer="";
    expectedLetters=[];
    graphicKeyboard.forEach(btn=>btn.setAttribute("disabled",true));
    hint="";
    hintDisplay.textContent=hint;
    textDisplay.textContent=revealed.join('');
}
function getRandomKey(){
    if(answers.length>0){
        return answers[Math.floor(Math.random()*(answers.length-1))];
    }else{
        return null;
    }
}
function processLetter(letter){
    if(expectedLetters.includes(letter)){
        revealLetter(letter);
        if(validLetters.push(letter)>=expectedLetters.length){
            endGame(validLetters.length>=expectedLetters.length);
        }
    }else{
        if(invalidLetters.push(letter)>=maxAttempts){
            updateStrikesDisplay();
            endGame(validLetters.length>=expectedLetters.length);
        }else if(invalidLetters.length>=(maxAttempts/2)&&hint.length>0){
            updateStrikesDisplay();
            hintDisplay.textContent="Hint: "+hint;
        }else{
            updateStrikesDisplay();
        }
    }
}
function revealLetter(letter){
    const revealed=textDisplay.textContent.split('');
    for(let position=0;position<answer.length;++position){
        if(answer[position].toLowerCase()===letter){
            revealed[position]=answer[position];
        }
    }
    textDisplay.textContent=revealed.join('');
}
function startGame(){
    const key=getRandomKey();
    if(key!==null){
        abortGameBtn.removeAttribute("disabled");
        answer=key.answer;
        const textDisplayString=answer;
        expectedLetters=answer.toLowerCase().split('');
        for(let l=0;l<expectedLetters.length;++l){
            if(otherCharRegEx.test(expectedLetters[l])){
                expectedLetters.splice(l,1);
            }
        }
        for(let first=0;first<expectedLetters.length;++first){
            for(let others=0;others<expectedLetters.length;++others){
                if(first!==others&&expectedLetters[first]===expectedLetters[others]){
                    expectedLetters.splice(others,1);
                }
            }
        }
        graphicKeyboard.forEach(btn=>btn.removeAttribute("disabled"));
        if(Object.hasOwn(key,"hint")&&typeof key.hint==="string"&&key.hint.length>0){
            hint=key.hint;
        }
        textDisplay.textContent=textDisplayString.replace(/[a-z]/gi,'_');
        updateStrikesDisplay();
        $(`.popup`).fadeOut();
    }else{
        console.log(`"${key}" is found, therefore, no valid answer key is obtained.`);
    }
}
function updateStrikesDisplay(){
    if(invalidLetters.length>0){
        graphicDisplay.innerHTML=`<img alt="Strike ${invalidLetters.length}" src="img/strike-${invalidLetters.length}.svg">`;
        $(`img`).css("max-width","100%");
    }else{
        graphicDisplay.innerHTML=``;
    }
}