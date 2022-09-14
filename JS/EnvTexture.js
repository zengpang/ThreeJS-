
var renderer;
const $ = s => document.querySelector(s);
var mainMatColor = $('#mainColor');
var fresnelMatColor = $('#envValue');
var fresnelMatPow = $('#rContrastValue');
var fresnelMatPower = $('#rInitValue');
var showModel;
var cubemapTexTexture;
//材质数学初始化
let initMatValue = {
    mainMatColor: hexToHSL(mainMatColor.value),
    cubemapTex: new THREE.RGBELoader()
        .setPath(`../texture/EnvTexture/CubeMap/`)
        .load(`1_HDR.HDR`),
    NormalTex: new THREE.TextureLoader().load("../texture/EnvTexture/T_Shield_N.png")
};
//本地工程文件读取
function load(name) {
    let xhr = new XMLHttpRequest(),
        okStatus = document.location.protocol === "file:" ? 0 : 200;
    xhr.open('GET', name, false);
    xhr.overrideMimeType("text/html;charset=utf-8");//默认为utf-8
    xhr.send(null);
    return xhr.status === okStatus ? xhr.responseText : null;
}

//Shader文件读取
var fragShaderStr;
var vertexShaderStr;
function shaderinit() {
    fragShaderStr = load(`./Shader/EnvShader.frag`);
    vertexShaderStr = load(`./Shader/EnvShader.vert`)
}
//猴头材质
var selfMat;

function matinit() {

    this.fragShaderStr = fragShaderStr;
    this.vertexShaderStr = vertexShaderStr;
    const path = '../texture/EnvTexture/CubeMap/pisa/';
    const format = '.png';
    const urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];

    selfMat = new THREE.ShaderMaterial({
        uniforms: {
            _mainColor: { value: new THREE.Vector3(initMatValue.mainMatColor[0], initMatValue.mainMatColor[1], initMatValue.mainMatColor[2]) },
            lightPosition: { value: new THREE.Vector3(0, 1.25, 1.25) },
            tilling: { value: new THREE.Vector2(1, 1) },
            _cubeMapTex: { value: new THREE.CubeTextureLoader().load( urls ) },
            _normalTex: { value: initMatValue.NormalTex },
            _cubeMapinit: { value: 2 },
            _aoAdjust: { value: 0.694 },
            _aoTex:{value:new THREE.TextureLoader().load("../texture/EnvTexture/T_Shield_AO.png")},
            _roughnessMap:{value:new THREE.TextureLoader().load("../texture/EnvTexture/T_FloorMarble_R.png")},
            _roughness: { value: 1.0 },
            _roughnessContrast: { value: 1.06 },
            _roughnessInit: { value: 1.92 },
            _roughnessMin: { value: 0.0 },
            _roughnessMax: { value: 0.7 }
        },
        //236,65,65
        vertexShader: this.vertexShaderStr,
        fragmentShader: this.fragShaderStr
    });
    console.log(selfMat.uniforms._cubeMapTex);
    // selfMat.extensions.derivatives = true;


}
mainMatColor.addEventListener("input", matColorChange, false);
fresnelMatColor.addEventListener("input", matColorChange, false);
function initRender() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    //修改渲染器输出格式
    renderer.outputEncoding = THREE.sRGBEncoding;
    //渲染器添加toneMapping效果
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;

    //告诉渲染器需要阴影效果 
    renderer.setClearColor('#1F2025', 1.0);
    document.getElementsByClassName('mainShow')[0].appendChild(renderer.domElement);
}
var EnvLight;
function initEnv() {

}
var camera;
function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(31.10476063070969, 5.39751544957362, -197.53318883944013);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}


var scene;
function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    //环境贴图读取
    new THREE.RGBELoader()
        .setPath(`../texture/EnvTexture/CubeMap/`)
        .load(`1_HDR.HDR`, function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            console.log(texture);


            scene.background = texture;
            scene.environment = texture;
        })

}

var light;
let directLight;
function initLight() {

    scene.add(new THREE.AmbientLight(0x444444));
    light = new THREE.PointLight(0xffffff);
    light.position.set(0, 1.25, 1.25);
    //告诉点光需要开启阴影投射
    light.castShadow = true;
    scene.add(light);


}
//模型初始化
function initModelFbx() {
    console.log(`执行`);
    var loader = new THREE.FBXLoader();
    loader.load("../Model/SM_Shield.fbx", function (object) {
        //创建纹理
        var mat = selfMat;
        let geometry = object.children[0].geometry;
        showModel = new THREE.Mesh(geometry, mat);;

        showModel.rotation.x = -0.5 * Math.PI; //将模型摆正
        showModel.rotation.z = -1 * Math.PI; //将模型摆正
        showModel.scale.set(0.2, 0.2, 0.2); //缩放
        // geometry.center(); //居中显示
        scene.add(showModel);
    });
}

//用户交互插件 鼠标左键按住旋转，右键按住平移，滚轮缩放
var controls;
function initControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    // 使动画循环使用时阻尼或自转 意思是否有惯性
    controls.enableDamping = true;
    //动态阻尼系数 就是鼠标拖拽旋转灵敏度
    //controls.dampingFactor = 0.25;
    //是否可以缩放
    controls.enableZoom = true;
    //是否自动旋转
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    //设置相机距离原点的最远距离
    controls.minDistance = 1;
    //设置相机距离原点的最远距离
    controls.maxDistance = 500;
    //是否开启右键拖拽
    controls.enablePan = true;
}
// x
// : 
// 31.10476063070969
// y
// : 
// 5.39751544957362
// z
// : 
// -197.53318883944013
function render() {
    renderer.render(scene, camera);

}

//窗口变动触发的函数
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    render();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    //更新控制器
    render();
    requestAnimationFrame(animate);
}


//材质颜色变化
function matColorChange(event) {
    let changeColor = hexToHSL(event.target.value);
    //event.target返回绑定事件的整个节点信息
    switch (event.target) {
        case mainMatColor: {
            selfMat.uniforms._mainColor.value = new THREE.Vector3(changeColor[0], changeColor[1], changeColor[2]);
        }; break;
       
    }

}
//材质变量
function matValueChange(event) {
    switch (event.target) {
        case fresnelMatPow: {
            showModel.material.uniforms.fresnelPow.value = fresnelMatPow.value;
        }; break;
        case fresnelMatPower: {
            showModel.material.uniforms.fresnelPower.value = fresnelMatPower.value;
        }; break;
    }
}
//颜色格式转换
function hexToHSL(hexColor) {
    let resultRgb = new Array(3).fill('');
    if (!(/#/).test(hexColor)) {
        console.log(`不符合格式，已停止转换`);
        return;
    }
    let hexColors = hexColor.split(/#|/);
    let hexindex = '';
    let rgbIndex = 0;
    for (let index = 1; index < hexColors.length; index++) {
        hexindex += hexColors[index];
        if (index % 2 == 0) {
            resultRgb[rgbIndex] = parseInt('0x'.concat(hexindex)) / 255.0;
            hexindex = '';
            rgbIndex++;

        }
    }
    return resultRgb;
}
function draw() {
    initScene();
    shaderinit();
    matinit();
    initRender();

    initCamera();
    initLight();
    initModelFbx();
    initControls();
    animate();
    window.onresize = onWindowResize;
}