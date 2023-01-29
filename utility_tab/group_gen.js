const sizeSpinner = document.querySelector("#size_spinner")
const extraHandler = document.querySelector("#extra_handler")
const groups = document.querySelector("#groups")
const groupGenButton = document.querySelector("#group_gen_button")
const classLayoutButton = document.querySelector("#class_layout_button")
const groupGenSection = document.querySelector("#group_gen")
const classLayoutSection = document.querySelector("#class_layout")
const buttonThatGens = document.querySelector("#group_gen")

groupGenButton.addEventListener("click", () => {
    groupGenSection.style.display = 'block'
    classLayoutSection.style.display = "none"
})
classLayoutButton.addEventListener("click", () => {
    groupGenSection.style.display = 'none'
    classLayoutSection.style.display = "block"
})

main()

function fetchJson(url)
{
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
            fetch(url, {
                method: `GET`,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(res => res.json()).then(resolve);
        });
    })
}

async function main()
{
    let students;
    let courses = (await fetchJson("https://classroom.googleapis.com/v1/courses?teacherId=me")).courses
    let classSelector = await setupClassSelector(courses)
    sizeSpinner.addEventListener("change", () => {
        generateGroups(students)
    })
    extraHandler.addEventListener("input", () => {
        generateGroups(students)
    })
    buttonThatGens.addEventListener("click", () => {
        generateGroups(students)
    })
    let currentClassId = classSelector.value
    classSelector.addEventListener("input", async function() {
        currentClassId = classSelector.value
        students = await getStudentsOf(currentClassId)
        generateGroups(students, sizeSpinner)
    })
    students = await getStudentsOf(currentClassId)
    // students = randNames(80, 90)
    generateGroups(students)
}

function generateGroups(students)
{
    const groupSize = sizeSpinner.valueAsNumber
    shuffle(students)
    groups.innerHTML = ""
    const groupList = []
    for (let i = 0; i < Math.ceil(students.length/groupSize); i++) {
        groupList[i] = []
        for (let j = 0; j < groupSize; j++) {
            if ((i * groupSize + j) < students.length) {
                const name = students[i * groupSize + j]
                //  last initial TODO will break if only first name (not possible? read file?)
                const short = name.substring(0, name.indexOf(" ") + 2)
                groupList[i][j] = short + "."
            }
        }
    }
    const lastGroup = groupList.at(-1)
    if(lastGroup.length < groupSize) {
        switch (extraHandler.value) {
            case "disperse": {
                let i = 0;
                while (lastGroup.length > 0) {
                    groupList[i++].push(lastGroup.pop())
                    i %= groupList.length
                }
                groupList.pop()
                break;
            }
            case "shrink": {
                let i = groupList.length - 1;
                while (lastGroup.length < groupList.at(-2).length - 1) {
                    lastGroup.push(groupList[i--].pop())
                    if (i < 0) i = groupList.length - 1;
                }
                break;
            }
        }
    }
    insertGroups(groupList)
}

function insertGroups(groupList)
{
    for (let i = 0; i < groupList.length; i++) {
        const groupDiv = document.createElement("div")
        groupDiv.classList.add("group")

        const header = document.createElement("h2")
        header.innerText = `Group #${i + 1}`

        const names = document.createElement("div")
        names.classList.add("names")
        setDraggingContainer(names)
        for (let j = 0; j < groupList[i].length; j++) {
            const name = document.createElement("p")
            name.textContent = groupList[i][j]
            setDraggable(name)
            names.appendChild(name)
        }
        let size = document.createElement("p")
        size.classList.add("group_size")
        size.textContent = groupList[i].length

        groupDiv.appendChild(header)
        groupDiv.appendChild(names)
        groupDiv.appendChild(size)
        groups.appendChild(groupDiv)
        names.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(sizeSpinner.valueAsNumber)) - 1}, minmax(8em, 1fr))`
    }
}

async function setupClassSelector(courses)
{
    let thisTab = (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0];
    let parentTabURL = undefined
    if(thisTab.openerTabId)
    {
        parentTabURL = (await chrome.tabs.get(thisTab.openerTabId))?.url
    }
    let fragmentFromClassroom = undefined
    if(parentTabURL && parentTabURL.match(/https:\/\/classroom\.google\.com\/u\/[0-9]\/[a-z].*/) != null)
    {
        fragmentFromClassroom = parentTabURL.replace(/https:\/\/classroom\.google\.com\/u\/[0-9]\/[a-z]\//, "").split("/")[0]
    }
    let classSelector = document.querySelector("select#class_selector")
    const newOption = (value, displayName) => {
        const option = document.createElement("option")
        option.value = value
        option.text = displayName
        return option
    }
    let fragToId = {}
    for (const course of courses) {
        if((await getStudentsOf(course.id))?.length >= 0)
        {
            fragToId[course.alternateLink.split("/").at(-1)] = course.id
            classSelector.appendChild(newOption(course.id, course.name))
        }
    }
    if(fragmentFromClassroom)
    {
        classSelector.value = fragToId[fragmentFromClassroom]
    } else {
        classSelector.selectedIndex = 0
    }
    return classSelector
}

async function getStudentsOf(id)
{
    if(!document.querySelector("#real_classes").checked)
    {
        return randNames(40, 45)
    }
    let url = "https://classroom.googleapis.com/v1/courses/" + id + "/students"
    return (await fetchJson(url)).students?.map(st => st.profile.name.fullName)
}

function setDraggingContainer(container) {
    container.addEventListener('dragover', () => {
        container.appendChild(document.querySelector('.dragging'))
    })
}

function setDraggable(draggable) {
    draggable.draggable = true;

    draggable.addEventListener('dragstart', () => {
        draggable.classList.add("dragging")
    })

    draggable.addEventListener('dragend', e => {
        e.preventDefault()
        draggable.classList.remove("dragging")
    })
}

function randNames(lower, upper)
{
    names = [
        "Maariyah Mora",
        "Tim Kaufman",
        "Melissa Pearce",
        "Troy Patton",
        "Angelo Mcdonald",
        "Fatma Mcclain",
        "Chiara Morrison",
        "Vincent Flynn",
        "Bradley Gordon",
        "Lauren Dotson",
        "Eric Phelps",
        "Carmen Larson",
        "Theo Pearson",
        "Fatimah Jackson",
        "Sam Estrada",
        "Kayleigh Saunders",
        "Amin Hewitt",
        "Autumn Snyder",
        "Daniella Rocha",
        "Frederic Edwards",
        "Angel Mclean",
        "Thalia Hoffman",
        "Isha Ayers",
        "Zachery Jones",
        "Marley Huber",
        "Haroon Macdonald",
        "Lorna Carver",
        "Lacey Martin",
        "Emmanuel Love",
        "Khalid Cochran",
        "Donald Tapia",
        "Leslie Simmons",
        "Marshall Keith",
        "Kieron Mooney",
        "Dalton Fisher",
        "Mia Buckley",
        "Keith Wong",
        "Liyana Reyes",
        "Myles Cruz",
        "Hugh Galvan",
        "Louisa Pace",
        "Scarlet Gutierrez",
        "Mariam Chase",
        "Clara Mercado",
        "Jordanne Gregory",
        "Gerald Washington",
        "Ciara Martinez",
        "Brittney Stokes",
        "Vanessa Sherman",
        "Reid Johnson",
        "Magnus Serrano",
        "Joao Patrick",
        "Velma Dickerson",
        "Hope Dyer",
        "Emilio Carroll",
        "Safa Mueller",
        "Willow Webster",
        "Aaliyah Brock",
        "Gideon Sanders",
        "Victoria Kelley",
        "Davina Dale",
        "Franciszek Sutherland",
        "Jim Donnelly",
        "Stacey Rollins",
        "Krystal Ballard",
        "Stanley Nash",
        "Asiya Rodgers",
        "Daniela Connolly",
        "Fraser Casey",
        "Devon Valentine",
        "Eleri Myers",
        "Ameera Blackwell",
        "Isaac Gray",
        "Anya Parrish",
        "Clark Kelly",
        "Wojciech Reynolds",
        "Edward Salinas",
        "Tom Tanner",
        "Yasir Roth",
        "Raphael Reeves",
        "Ieuan Mullen",
        "Russell Franco",
        "Dafydd Romero",
        "Santiago Kirk",
        "Jerome Burnett",
        "Leland Davila",
        "Sapphire Khan",
        "Kobi Morgan",
        "Helen Perkins",
        "Safwan Mack",
        "Caspar Cummings",
        "Vinny Blaese",
        "Dylan Mccarty",
        "Jasper Neal",
        "Hana Campos",
        "Jimmy Wood",
        "Dawid Bradford",
        "Emre Hodge",
        "Logan Weeks",
        "Demi Randall",
    ]
    let c = Math.floor(Math.random() * (upper-lower) + lower);
    let list = []

    while(list.length < c) {
        let index = Math.floor( Math.random()*names.length );
        list.push(names[index] );
        names.splice(index, 1 ); // Remove the item from the array
    }
    return list
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}