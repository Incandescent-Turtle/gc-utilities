let selected = undefined

class Element {
    constructor(x, y, width, height, colour, seat) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.colour = colour
        this.seat = seat
    }

    draw(ctx)
    {
        ctx.fillStyle = selected === this ? "#00E4FF" : this.colour
    }

    click()
    {
        selected = this
        updateUI(this)
        drawElems()
    }

    isClicking(x, y)
    {

    }

    changeWidth(amt)
    {
        if(amt < 0 && this.width > 20 || amt > 0)
        {
            this.width += amt
        }
        updateUI(selected)
    }

    changeHeight(amt)
    {
        if(amt < 0 && this.height > 20 || amt > 0)
        {
            this.height += amt
        }
        updateUI(selected)
    }
}

class Rectangle extends Element{

    constructor(x, y, width, height, colour, seat) {
        super(x, y, width, height, colour, seat)
    }

    draw(ctx)
    {
        super.draw(ctx)
        ctx.beginPath();
        ctx.rect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
        ctx.fill()
        if(this.string)
        {
            drawStroked(this.string, this.x, this.y)
        }
    }

    isClicking(x, y)
    {
        return y > (this.y - this.height/2) && y < (this.y - this.height/2) + this.height
        && x > (this.x - this.width/2) && x < (this.x - this.width/2) + this.width
    }
}

class Circle extends Element{

    constructor(x, y, width, height, colour, seat) {
        super(x, y, width, width, colour, seat)
    }

    draw(ctx)
    {
        super.draw(ctx)
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.width/2, 0, 2 * Math.PI, false)
        ctx.fill()
        if(this.string) {
            drawStroked(this.string, this.x, this.y)
        }
    }

    isClicking(x, y)
    {
        let dist = Math.sqrt(Math.pow(x-this.x, 2) + Math.pow(y-this.y, 2))
        return dist <= this.width/2
    }

    changeWidth(amt) {
        super.changeWidth(amt);
        this.height = this.width
        updateUI(selected)
    }

    changeHeight(amt)
    {
        this.width += amt
        this.height = this.width
        heightSpinner.value = this.height
        updateUI(selected)
    }
}

function drawStroked(text, x, y) {
    ctx.font = '1em serif Sans-serif';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
}


let c = document.querySelector("canvas")
let mouseDown = false
c.onmousedown = () => mouseDown = true;
c.onmouseup = () => mouseDown = false;
c.onmousemove = moveMouse;
let canvasContainer = document.querySelector("#canvas_container")
c.width = 400;
c.height = 400;
let ctx = c.getContext("2d");
ctx.font = "1em serif";
let elems = []

function drawElems()
{
    ctx.clearRect(0,0,c.width,c.height)
    for (const elem of elems) {
        elem.draw(ctx)
    }
}

const rectangleCreator = document.querySelector("#rectangle_creator")
const circleCreator = document.querySelector("#circle_creator")
const widthSpinner = document.querySelector("#width_spinner")
const heightSpinner = document.querySelector("#height_spinner")
const colourSelector = document.querySelector("#colour_selector")
const seatBox = document.querySelector("#seat_box")
const placeStudentsButton = document.querySelector("#place_students")

rectangleCreator.addEventListener("click", () => {
    let w = widthSpinner.valueAsNumber
    let h = heightSpinner.valueAsNumber
    elems.push(new Rectangle(c.width/2-w/2, c.height/2-h/2, w, h, colourSelector.value, seatBox.checked))
    drawElems()
})
circleCreator.addEventListener("click", () => {
    let w = widthSpinner.valueAsNumber
    let h = heightSpinner.valueAsNumber
    elems.push(new Circle(c.width/2, c.height/2, w, h, colourSelector.value, seatBox.checked))
    drawElems()
})
widthSpinner.addEventListener("input", () => {
    if(selected)
    {
        selected.width = widthSpinner.value
        drawElems()
    }
})
heightSpinner.addEventListener("input", () => {
    if(selected)
    {
        selected.height = heightSpinner.value
        drawElems()
    }
})
colourSelector.addEventListener("change", () => {
    if(selected)
    {
        selected.colour = colourSelector.value
        drawElems()
    }
})
seatBox.addEventListener("change", () => {
    if(selected)
    {
        selected.seat = seatBox.checked
        drawElems()
    }
})
placeStudentsButton.addEventListener("click", placeStudents)


 c.addEventListener('mousedown', function(event) {
    let cLeft = c.offsetLeft + c.clientLeft
    let cTop = c.offsetTop + c.clientTop
    let x = event.pageX - cLeft
    let y = event.pageY - cTop;

    // Collision detection between clicked offset and element.
     if(selected?.isClicking(x,y))
     {
         selected.click()
     } else {
         for (const elem of elems) {
             if (elem.isClicking(x, y)) {
                 elem.click();
                 drawElems()
                 return
             }
         }
         selected = undefined
     }
     drawElems()
}, false);

function updateUI(elem)
{
    widthSpinner.value = elem.width
    heightSpinner.value = elem.height
    colourSelector.value = elem.colour
    seatBox.checked = elem.seat
}

function moveMouse(evt)
{
    if(mouseDown)
    {
        let cLeft = c.offsetLeft + c.clientLeft
        let cTop = c.offsetTop + c.clientTop
        let x = evt.pageX - cLeft
        let y = evt.pageY - cTop;
        if(selected?.isClicking(x, y))
        {
            selected.x = x
            selected.y = y
            drawElems()
        }
    }
}

document.addEventListener('keydown', (event) => {
    if(!selected)
        return
    switch(event.code)
    {
        case "Minus":
            selected.changeWidth(-1)
            selected.changeHeight(-1)
            break
        case "Equal":
            selected.changeWidth(1)
            selected.changeHeight(1)
            break
        case "Delete":
            elems.splice(elems.indexOf(selected), 1)
            break
        case "KeyD":
            if(selected instanceof Rectangle) {
                elems.push(new Rectangle(selected.x, selected.y, selected.width, selected.height, selected.colour, selected.seat))
            } else if(selected instanceof Circle) {
                elems.push(new Circle(selected.x, selected.y, selected.width, selected.height, selected.colour, selected.seat))
            }
            break
    }
    drawElems()
    console.log(event.code)
}, false);

let clear = document.querySelector("#clear")
clear.addEventListener("click", () => {
    elems = []
    drawElems()
    selected = undefined
})

function placeStudents()
{
    let seats = elems.filter(el => el.seat)
    let students = randNames(20,30)
    shuffle(seats)
    for(const i in seats) {
       seats[i].string = students[i]
    }
    drawElems()
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
        list.push(names[index].substring(0, names[index].indexOf(" ") + 2));
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