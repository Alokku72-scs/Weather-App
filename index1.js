const userTab= document.querySelector("[data-userWeather]");
const searchTab= document.querySelector("[data-searchWeather]");
const userContainer= document.querySelector(".weather-container");

const grantAccessContainer=document.querySelector(".grant-location-container");
const searchForm=document.querySelector("[data-searchFrom]");
const loadingScreen=document.querySelector(".loading-container");
const userInfoContainer=document.querySelector(".user-info-container");

//initially variables need??
const notFound = document.querySelector('.errorContainer');
const errorBtn = document.querySelector('[data-errorButton]');
const errorText = document.querySelector('[data-errorText]');
const errorImage = document.querySelector('[data-errorImg]');

let currentTab=userTab;
const API_KEY="6aa9e429de058cb6d0c3d99d043b3d69";
currentTab.classList.add("current-tab");
     getFromSessionStorage();

function switchTab(clickedTab){
    notFound.classList.remove("active")
    if(currentTab != clickedTab ){
        currentTab.classList.remove("current-tab");
        currentTab=clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }else{
            //main pehle search wale tab pr tha, ab your weather tab visible krna hai
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //ab main your tab me aagya hu, toh weather bhi display karna padega, so let's check local storage first
            //for coordinates, if we haved saved them there.
            getFromSessionStorage();
        }
    }
}

userTab.addEventListener("click", ()=> {
    //pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click" ,() =>{
    //pass clicked tab as input parameter
    switchTab(searchTab);    
});

//check if coordinates are already present in session storage
function getFromSessionStorage(){
    const localCoordinates=sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        //agr local coordinates nhi mile
        grantAccessContainer.classList.add("active");
    }else{
        const coordinates=JSON.parse(localCoordinates);
        fetchUserWeatherInfoByCoords(coordinates);
    }
}


async function fetchUserWeatherInfoByCoords(coordinates){
    const {lat,lon}=coordinates;
    //make grrantcontainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //API call
    try{
        const response= await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data=await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
        //
    }
}


function renderWeatherInfo(weatherInfo){
    //firstly, we have to fetch the elements

    const cityName=document.querySelector("[data-cityName]");
    const countryIcon=document.querySelector("[data-countryIcon]");
    const desc=document.querySelector("[data-weatherDesc]");
    const weatherIcon=document.querySelector("[data-weatherIcon]");
    const temp=document.querySelector("[data-temp]");
    const windspeed=document.querySelector("[data-windspeed]");
    const humidity=document.querySelector("[data-humidity]");
    const cloudiness=document.querySelector("[data-cloudiness]");

    //fetch values from weatherinfo object and put it UI elements
    cityName.innerText=weatherInfo?.name;
    countryIcon.src=`https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText=weatherInfo?.weather?.[0]?.description;
    weatherIcon.src=`http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText=`${weatherInfo?.main?.temp} °C`;
    windspeed.innerText=`${weatherInfo?.wind?.speed.toFixed(2)} m/s`;
    humidity.innerText=`${weatherInfo?.main?.humidity.toFixed(2)}%`;    
    cloudiness.innerText=`${weatherInfo?.clouds?.all.toFixed(2)}%`;
}


function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }else{
        console.error("current position not found");
    }
}

function showPosition(position){
    const userCoordinates={
        lat:position.coords.latitude,
        lon:position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfoByCoords(userCoordinates);
}

const grantAccessButton=document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);


const searchInput=document.querySelector("[data-searchInput]");

searchForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    let cityName=searchInput.value;
    if(cityName==="") return ;   
    fetchUserWeatherInfoByCity(cityName);
    searchInput.value="";

});

async function fetchUserWeatherInfoByCity(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    notFound.classList.remove("active");

    try{
        const response=await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data=await response.json();
        if(!data.sys){
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }catch(err){
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        notFound.classList.add("active");
        errorText.innerText = `${err?.message}`;
        errorBtn.style.display = "none";
    }
}