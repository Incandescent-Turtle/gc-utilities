function addLocationObserver(callback) {

    // Options for the observer (which mutations to observe)
    const config = { attributes: false, childList: true, subtree: false }

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback)

    // Start observing the target node for configured mutations
    observer.observe(document.body, config)
}

function observerCallback() {

    if (window.location.href.match(/https:\/\/classroom\.google\.com\/u\/[0-9]\/(c|r|w|c)/) != null) {
        attempt_button_insert()
    }
}
addLocationObserver(observerCallback)
observerCallback()

function attempt_button_insert() {
    let jsInitCheckTimer = setInterval(checkForJS_Finish, 111)


    function checkForJS_Finish() {
        if(document.readyState === "complete")
        {
            clearInterval(jsInitCheckTimer);
            setTimeout(() => {
                let bar = document.querySelector("div.xHPsid")
                if(bar.childElementCount > 4)
                {
                    return
                }
                let button_div = bar.lastElementChild.cloneNode(false)
                let as = Array.from(bar.querySelectorAll("a"))
                let selected = as.filter(el => hasAria(el))[0]
                let unselected = as.filter(el => !hasAria(el))[0]
                let button_a = document.createElement("a")
                button_a.classList = unselected.classList
                button_a.innerText = "Utilities"
                button_a.target = "_self"
                button_div.addEventListener('click', evt => {
                chrome.runtime.sendMessage({
                    action: "create_tab",
                });


                    // button_a.classList = selected.classList
                    // selected.classList = unselected.classList
                    // let main;
                    // switch (selected.innerText)
                    // {
                    //     case "Stream":
                    //         main = document.querySelector("c-wiz > div > div > div.dbEQNc")
                    //         break
                    //     case "Classwork":
                    //         main = document.querySelector("c-wiz > div > div > div.BdCNc")
                    //         break
                    //     case "People":
                    //         main = document.querySelector("c-wiz > div > div > main.Z3qXvc.YHNy6b")
                    //         break
                    //     case "Grades":
                    //         main = document.querySelector("c-wiz > div > div > div[jscontroller=UqV0cb]")
                    //         break
                    //     default:
                    //         main = undefined
                    // }
                    // let div = document.createElement("div")
                    // div.innerHTML = `<p></p><div><p>hello</p></div>`
                    // div.classList.add("hucker")
                    // main.parentNode.parentNode.appendChild(div)
                    // main.remove()
                    //classwork BdCNc
                //    dbEQNc for stream
                    // jscontroller="UqV0cb" grades

                })
                button_div.appendChild(button_a)
                bar.appendChild(button_div)
            },1000)
        }
    }
}

function hasAria(el)
{
    return el.hasAttribute("aria-label")
}