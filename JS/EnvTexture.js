var renderer;
var mainMatColor=document.getElementsByClassName('matColor')[0];
var fresnelMatColor=document.getElementsByClassName('fresnelColor')[0];
var fresnelMatPow=document.getElementsByClassName('fresnelPow')[0];
var fresnelMatPower=document.getElementsByClassName('fresnelPower')[0];
var monkeyHead;
let initMatValue={
    mainMatColor:hexToHSL(mainMatColor.value),
    fresnelColor:hexToHSL(fresnelMatColor.value),
    fresnelPower:fresnelMatPower.value,
    fresnelPow  :fresnelMatPow.value
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
function shaderinit()
{
     fragShaderStr=load(`/Shader/EnvShader.frag`);
     vertexShaderStr=load(`/Shader/EnvShader.vert`)
}
//猴头材质
var selfMat;
function matinit()
{
    this.fragShaderStr=fragShaderStr;
    this.vertexShaderStr=vertexShaderStr;
    selfMat= new THREE.ShaderMaterial({
        uniforms:{
         fresnelPow:{value:initMatValue.fresnelPow},
         fresnelPower:{value:initMatValue.fresnelPower},
         fresnelColor:{value:new THREE.Vector3(initMatValue.fresnelColor[0],initMatValue.fresnelColor[1],initMatValue.fresnelColor[2])},
         mainColor:{value:new THREE.Vector3(initMatValue.mainMatColor[0],initMatValue.mainMatColor[1],initMatValue.mainMatColor[2])},
         lightPosition:{value:new THREE.Vector3(0,50,50)}, 
        },
        //236,65,65
        vertexShader:this.fragShaderStr,
        fragmentShader:this.vertexShaderStr
     });
}
mainMatColor.addEventListener("input",matColorChange,false);
fresnelMatColor.addEventListener("input",matColorChange,false);
function initRender() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    //告诉渲染器需要阴影效果 
	renderer.setClearColor('#1F2025',1.0);
    document.getElementsByClassName('mainShow')[0].appendChild(renderer.domElement);
}
var EnvLight;
function initEnv()
{
    
}
var camera;
function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 4);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

var scene;
function initScene() {
    scene = new THREE.Scene();
}

var light;
function initLight() {
   
    scene.add(new THREE.AmbientLight(0x444444));
    light = new THREE.PointLight(0xffffff);
    light.position.set(0, 50, 50);
    //告诉平行光需要开启阴影投射
    light.castShadow = true;
    scene.add(light);
}
//模型初始化
function initModel() {
    var loader = new THREE.STLLoader();
    loader.load("../Model/MonkeyHead.stl", function (geometry) {
        //创建纹理
        var mat = selfMat;
        monkeyHead = new THREE.Mesh(geometry, mat);
        monkeyHead.rotation.x = -0.5 * Math.PI; //将模型摆正
        monkeyHead.scale.set(1, 1, 1); //缩放
        geometry.center(); //居中显示
        scene.add(monkeyHead);
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
    controls.maxDistance = 200;
    //是否开启右键拖拽
    controls.enablePan = true;
}
//#1A2A3B
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
function matColorChange(event) 
{
    let changeColor= hexToHSL(event.target.value);
    //event.target返回绑定事件的整个节点信息
    switch(event.target)
    {
      case mainMatColor:{
        monkeyHead.material.uniforms.mainColor.value =new THREE.Vector3(changeColor[0],changeColor[1],changeColor[2]);
      };break;
      case fresnelMatColor:{
        monkeyHead.material.uniforms.fresnelColor.value =new THREE.Vector3(changeColor[0],changeColor[1],changeColor[2]);
      };break;
    }
   
}
//材质变量
function matValueChange(event)
{
    switch(event.target)
    {
      case fresnelMatPow:{
        monkeyHead.material.uniforms.fresnelPow.value =fresnelMatPow.value;
      };break;
      case fresnelMatPower:{
        monkeyHead.material.uniforms.fresnelPower.value =fresnelMatPower.value;
      };break;
    }
}
//颜色格式转换
function hexToHSL(hexColor)
{
    let resultRgb=new Array(3).fill('');
    if(!(/#/).test(hexColor))
    {
      console.log(`不符合格式，已停止转换`);
      return;
    }
    let hexColors = hexColor.split(/#|/);
    let hexindex='';
    let rgbIndex=0;
    for(let index=1;index<hexColors.length;index++)
    {
        hexindex+=hexColors[index];
        if(index%2==0)
        {
            resultRgb[rgbIndex]=parseInt('0x'.concat(hexindex))/255.0;
            hexindex='';
            rgbIndex++;
            
        }
    }
    return resultRgb;
}
function draw() {
    shaderinit();
    matinit();
    initRender();
    initScene();
    initCamera();
    initLight();
    initModel();
    initControls();
    animate();
    window.onresize = onWindowResize;
}