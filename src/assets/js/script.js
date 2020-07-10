var date = new Date();
var element = document.getElementById('time');

function getTime(date){
    return data.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}
//returnの最初のdateをわざとdataと間違えて記述してみました。
element.innerHTML = getTime(date);