function setSavedElem(id) {
    const elem = document.getElementById(id);
    if (elem) {
        const saved = localStorage.getItem(elem.id);
        if (saved !== null) elem.value = saved;
        elem.addEventListener('input', () => {
            localStorage.setItem(elem.id, elem.value ?? '');
        });
    }
    return elem;
}

function setCommand(id, command, method, onParams, onOk, onError) {
    const elem = document.getElementById(id);
    if (elem) {
        elem.addEventListener('click', (e) => {
            e.preventDefault();

            const id = idInstance.value;
            const token = ApiTokenInstance.value;
            if (!id || !token) {
                alert('Please enter idInstance and ApiTokenInstance');
                return;
            }

            fetch(`https://1103.api.green-api.com/waInstance${id}/${command}/${token}`, {
                method: method || 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: onParams ? JSON.stringify(onParams()) : undefined
            })
                .then((response) =>
                    response
                        .json()
                        .catch(() => null)
                        .then((data) => ({ response, data }))
                )
                .then(({ response, data }) => {

                    if (!response.ok) {
                        throw new Error(data?.error || data?.message || response.status);
                    }
                    else {
                        onOk(response, data);
                    }
                })
                .catch((error) => {
                    onError(error);
                });


        });
    }
    return elem;
}

function sendMessage(type, title, message) {
    const date = new Date();
    message = message.replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    messages.innerHTML =
        `<li class="list-group-item text-${type}">
        <div class="fw-bold">${title}</div>
        <pre>${message}</pre>
        <div class="text-muted text-end">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div>
        </li>`
        + (messages.innerHTML || '');
}

const idInstance = setSavedElem('idInstance');
const ApiTokenInstance = setSavedElem('ApiTokenInstance');
const messagePhone = setSavedElem('messagePhone');
const messageText = setSavedElem('messageText');
const messagePhone1 = setSavedElem('messagePhone1');
const messageUrl = setSavedElem('messageUrl');

const messages = document.getElementById('messages');


setCommand('getSettings', 'getSettings', 'GET', undefined,
    (response, data) => { sendMessage('dark', 'Settings', JSON.stringify(data, null, 2)); },
    (error) => { sendMessage('danger', 'Error', error.message); }
);
setCommand('getStateInstance', 'getStateInstance', 'GET', undefined,
    (response, data) => { sendMessage('dark', 'State', JSON.stringify(data, null, 2)); },
    (error) => { sendMessage('danger', 'Error', error.message); }
);

setCommand('sendMessage', 'sendMessage', 'POST',
    () => {
        return {
            chatId: `${messagePhone.value}@c.us`,
            message: messageText.value
        }
    },
    (response, data) => { sendMessage('dark', `Send message (${messagePhone.value})`, `${messageText.value}\n\n${JSON.stringify(data)}`); },
    (error) => { sendMessage('danger', 'Error', error.message); }
);

setCommand('sendFileByUrl', 'sendFileByUrl', 'POST',
    () => {
        return {
            chatId: `${messagePhone1.value}@c.us`,
            urlFile: messageUrl.value,
            fileName: messageUrl.value.split('/').pop()
        }
    },
    (response, data) => { sendMessage('dark', `Send file by URL (${messagePhone1.value})`, `${messageUrl.value}\n\n${JSON.stringify(data)}`); },
    (error) => { sendMessage('danger', 'Error', error.message); }
);



