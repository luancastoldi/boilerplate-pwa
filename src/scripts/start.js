var db;

const select = {
  "id": null,
  "photo64": null,
  "desc": null
}

startApp();



function startApp() {

  mapBtns();
  openDB();
}

//resto do código

function ordenaFotos() {

  let aux = 0
  let espaco = 500;

  let largura = 300;
  let posicao = 10;

  document.querySelectorAll('.foto').forEach(y => {
    y.style.width = `${largura}px`;
    y.style.top = `${aux}px`
    // y.style.translate = `${posicao}px`
    aux = aux - espaco;
    largura = largura - 20;
    posicao = posicao - 10;
  })
}


function carregaFotos(json) {
  let contador = 1


  document.getElementById('cards').textContent = "";

  json.forEach(element => {
    // console.log(element);

    let lyt = `
          <div class="card" id="card_${contador}" style="--index: ${contador};">
                <div class="card__content">  
                    <figure>
                        <img src="${element.photo64}" alt="Image description">
                    </figure>
                    <div>
                    ${element.desc}
                    </div>
                </div>
            </div>
      `
    document.getElementById('cards').insertAdjacentHTML("afterbegin", lyt)
    document.querySelectorAll('.card')[0].addEventListener('click', (e) => selectPhoto(element.id, e.target))
    // console.log(lyt);

    document.querySelector('.list-compare').insertAdjacentHTML('afterbegin', `<img src="${element.photo64}" alt="">`)

    contador++;
  });
}

function selectPhoto(id, element) {

  const elemento = element.parentElement;

  select.id = id;
  select.photo64 = elemento.querySelector('img').src;
  isOpenAction(true);
}


function uploadInfo() {
  let input = `<input type="file" id="fileInput" accept="image/*">`
  document.querySelector('body').insertAdjacentHTML('afterbegin', input);

  const fileInput = document.getElementById('fileInput');
  fileInput.style.visibility = "hidden"
  fileInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {

        var preview = document.querySelector(".preview")
        preview.style.visibility = "visible"
        preview.style.display = "flex"
        preview.querySelector('img').src = e.target.result
      };
      reader.readAsDataURL(file);
    }
  });

  fileInput.click();
  fileInput.remove()
}

function mapBtns() {

  document.getElementById('up_foto').addEventListener('click', () => {
    isOpenAction(false);
    uploadInfo()
  })

  document.querySelector(".btn-canc-photo").addEventListener('click', () => closePreview())

  document.querySelector('.btn-save-photo').addEventListener('click', () => {
    let img = document.querySelector(".preview>img").src;
    let legenda = document.getElementById('leg_img').value;
    addData({ photo64: img, desc: legenda });
    closePreview();
    getAllData()
  })

  document.querySelector('.btn-del-img').addEventListener('click', () => deleteData(select.id))
  document.querySelector('.btn-switch-img').addEventListener('click', () => isOpenCompare(true))
  document.querySelector('.btn-close-compare').addEventListener('click', () => isOpenCompare(false))


}


function closePreview() {
  var preview = document.querySelector(".preview")
  preview.style.visibility = "hidden"
  preview.style.display = "none"
  preview.querySelector('img').src = ""
}


function openDB() {

  let request = indexedDB.open('myDatabase', 1);

  request.onupgradeneeded = function (event) {
    db = event.target.result;

    // Criar object store (semelhante a uma tabela)
    if (!db.objectStoreNames.contains('myObjectStore')) {
      db.createObjectStore('myObjectStore', { keyPath: 'id', autoIncrement: true });
    }
  };

  request.onsuccess = function (event) {
    db = event.target.result;
    console.log('Banco de dados aberto com sucesso');
    getAllData();
  };

  request.onerror = function (event) {
    console.error('Erro ao abrir o banco de dados', event.target.error);
  };

}

function addData(data) {
  let transaction = db.transaction(['myObjectStore'], 'readwrite');
  let objectStore = transaction.objectStore('myObjectStore');

  let request = objectStore.add(data);

  request.onsuccess = function () {
    console.log('Dados adicionados com sucesso');
  };

  request.onerror = function (event) {
    console.error('Erro ao adicionar dados', event.target.error);
  };
}


function getAllData() {
  let transaction = db.transaction(['myObjectStore'], 'readonly');
  let objectStore = transaction.objectStore('myObjectStore');

  let request = objectStore.getAll();

  request.onsuccess = function () {
    carregaFotos(request.result)
  };

  request.onerror = function (event) {
    console.error('Erro ao pegar todos os dados', event.target.error);
  };
}



function isOpenAction(flag) {

  const act = document.querySelector('.actions')

  if (flag) {
    document.getElementById('mini_img').src = select.photo64;
    act.style.visibility = "visible"
    act.style.display = "flex"
  } else {
    document.getElementById('mini_img').src = ""
    act.style.visibility = "hidden"
    act.style.display = "none"
  }
}


function deleteData(id) {
  if (confirm("Deseja remover a imagem?")) {
    let transaction = db.transaction(['myObjectStore'], 'readwrite');
    let objectStore = transaction.objectStore('myObjectStore');

    let request = objectStore.delete(id);

    request.onsuccess = function () {
      console.log('Dado deletado com sucesso');
      isOpenAction(false);
      getAllData();
    };

    request.onerror = function (event) {
      console.error('Erro ao deletar dado', event.target.error);
    };
  }

}


function isOpenCompare(flag) {

  const act = document.querySelector('.compare')

  if (flag) {
    isOpenAction(false)

    document.querySelector('.compare-1').src = select.photo64;
    // document.querySelector('.compare-2').src = select.photo64;
    act.style.visibility = "visible"
    act.style.display = "flex"
  } else {


    document.querySelector('.compare-1').src = "";
    // document.querySelector('.compare-2').src = "";
    act.style.visibility = "hiddem"
    act.style.display = "none"
  }
}