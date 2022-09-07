const $=s=>document.querySelector(s);
var renderer;
var mainMatColor=document.getElementsByClassName('matColor')[0];
console.log(mainMatColor);
var title=$(`header h1`);
var drawContent=$(`.mainShow`);
// let initMatValue={
//     mainMatColor:hexToHSL(mainMatColor.value),
//     fresnelColor:hexToHSL(fresnelMatColor.value),
//     fresnelPower:fresnelMatPower.value,
//     fresnelPow  :fresnelMatPow.value
// };
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
function initShader()
{
     fragShaderStr=load(`/Shader/MapShader.frag`);
     vertexShaderStr=load(`/Shader/MapShader.vert`)
}
//猴头材质
// var selfMat;
// function initMat()
// {
//     this.fragShaderStr=fragShaderStr;
//     this.vertexShaderStr=vertexShaderStr;
//     selfMat= new THREE.ShaderMaterial({
//         uniforms:{
//          fresnelPow:{value:initMatValue.fresnelPow},
//          fresnelPower:{value:initMatValue.fresnelPower},
//          fresnelColor:{value:new THREE.Vector3(initMatValue.fresnelColor[0],initMatValue.fresnelColor[1],initMatValue.fresnelColor[2])},
//          mainColor:{value:new THREE.Vector3(initMatValue.mainMatColor[0],initMatValue.mainMatColor[1],initMatValue.mainMatColor[2])},
//          lightPosition:{value:new THREE.Vector3(0,50,50)}, 
//         },
//         //236,65,65
//         vertexShader:this.fragShaderStr,
//         fragmentShader:this.vertexShaderStr
//      });
// }
// mainMatColor.addEventListener("input",matColorChange,false);
// fresnelMatColor.addEventListener("input",matColorChange,false);

//https://c.m.163.com/ug/api/wuhan/app/data/list-total
function initRender() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    //告诉渲染器需要阴影效果 
	renderer.setClearColor('#1F2025',1.0);
    document.getElementsByClassName('mainShow')[0].appendChild(renderer.domElement);
}
//环境光初始化
var EnvLight;
function initEnv()
{
    
}
var camera;
function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, -150, 300);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

var scene;
function initScene() {
    scene = new THREE.Scene();
}

var light;
function initLight() {
       // 半球光
       let hemiLight = new THREE.HemisphereLight('#80edff','#75baff', 0.3)
       // 这个也是默认位置
       hemiLight.position.set(0, 50, 50)
       scene.add(hemiLight)
    scene.add(new THREE.AmbientLight(0x444444));
    light = new THREE.PointLight(0xffffff);
    light.position.set(0, 50, 50);
    //告诉平行光需要开启阴影投射
    light.castShadow = true;
    scene.add(light);
}
//地图初始化
//投影公式
var projection=d3.geoMercator().center([116.412318,39.909843]).translate([10,-20]);
var chinaMap=new THREE.Object3D();
var provinces=new Array();
var provinceIndex=0;
function initMap()
{
   const loader=new THREE.FileLoader();
   loader.load(`./Model/JSON/china.json`,(data)=>{
      const MapStr=JSON.parse(data);
      const MapDate=MapStr.features;
      drawMap(MapDate);
   });
}
//几何体绘制
function drawMesh(polygon,color)
{
   const shape=new THREE.Shape();
   polygon.forEach((row,i)=>{
      const [x,y]=projection(row);
      if(i===0)
      {
        shape.moveTo(x,-y);
      }
      shape.lineTo(x,-y);
   });
   const geometry=new THREE.ExtrudeGeometry(shape,{
    depth:10,
    bevelEnabled: false
   });
   const material=new THREE.MeshBasicMaterial({
    color:color,
    transparent:true,
    opacity: 0.3
   })
//  const material=selfMat;
   const resultMesh=new THREE.Mesh(geometry,material);
   resultMesh.scale.set(1,1,0.1);
   return resultMesh;
}
//边框绘制
function lineDraw(polygon,color)
{
  const lineGeometry=new THREE.BufferGeometry();
  const pointsArray=new Array();
  polygon.forEach((row)=>{
    const [x,y]=projection(row);
    //创建三维点
    pointsArray.push(new THREE.Vector3(x,-y,10));
  })
  lineGeometry.setFromPoints(pointsArray);
  //线性材质
  const lineMaterial=new THREE.LineBasicMaterial({
    color:color
  });
  return new THREE.Line(lineGeometry,lineMaterial);
}
//地图绘制
function drawMap(MapDate)
{
    const mapBaseColor=`#3597D4`;
    MapDate.forEach((feature)=>{
      const province=new THREE.Object3D();
      province.properties=feature.properties.name;
      province.name=`chinaMap${provinceIndex}`;
      const coordinates=feature.geometry.coordinates;
      if(feature.geometry.type===`MultiPolygon`)
      {
        
        coordinates.forEach((coordinate)=>{
            coordinate.forEach((rows)=>{
                const mesh=drawMesh(rows,mapBaseColor);
                const line=lineDraw(rows,mapBaseColor);
                province.add(line);
                province.add(mesh);
            })
        })
      }
      if(feature.geometry.type===`Polygon`)
      {
        coordinates.forEach((coordinate)=>{
            const mesh=drawMesh(coordinate,mapBaseColor);
            const line=lineDraw(coordinate,mapBaseColor);
            province.add(line);
            province.add(mesh);
        })
      }
      provinces.push(province);
      chinaMap.add(province);
      provinceIndex++;
    })
    scene.add(chinaMap);
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
    //设置相机距离原点的最近距离
    controls.minDistance = 1;
    //设置相机距离原点的最远距离
    controls.maxDistance = 400;
    //是否开启右键拖拽
    controls.enablePan = true;
    //限制相机水平角度最小值
    controls.minAzimuthAngle=-Math.PI * (50/180);
    //限制相机水平角度最大值
    controls.maxAzimuthAngle = Math.PI * (50/180);
    //限制相机垂直角度最小值
    controls.minPolarAngle = -Math.PI * (100/180);
    //限制相机垂直角度最大值
    controls.maxPolarAngle =Math.PI * 1;
   
}

//每帧渲染
function render() {
    if(raycaster)
    {
        
        raycaster.setFromCamera(mouse,camera);
    }
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
var raycaster=new THREE.Raycaster();
var selectedObject;
var mouse=new THREE.Vector2();
//鼠标移动获取射线终点事件
function onMouseMove(event)
{
    let{top,left,width,height}=drawContent.getBoundingClientRect();
    let clientX=event.clientX-left;
    let clientY=event.clientY-top;
    mouse.x=(clientX/width)*2-1;
    mouse.y=-(clientY/height)*2+1;
  
}
//射线检测事件
function rayCastEvent()
{
   if(selectedObject)
   {
    selectedObject.material.opacity=0.3;
    selectedObject=null;
   }
   if(raycaster)
   {
    
    const intersects=raycaster.intersectObjects(provinces,true);
    if(intersects.length>0)
    {
      
        const res=intersects.filter(function(res){
            return res && res.object;
        })[intersects.length-1];

        if(res && res.object)
        {
            selectedObject=res.object;
            
          
            
            selectedObject.material.opacity=1;
        }
    }
   }
}
function mapClick()
{
    if(selectedObject)
    {
        console.log(selectedObject.parent.properties);
        title.innerText=selectedObject.parent.properties;
        
    }
}
// //材质颜色变化
// function matColorChange(event) 
// {
//     let changeColor= hexToHSL(event.target.value);
//     //event.target返回绑定事件的整个节点信息
//     switch(event.target)
//     {
//       case mainMatColor:{
        
//         selfMat.uniforms.mainColor.value=new THREE.Vector3(changeColor[0],changeColor[1],changeColor[2]);
//       };break;
//       case fresnelMatColor:{
//         selfMat.uniforms.fresnelColor.value =new THREE.Vector3(changeColor[0],changeColor[1],changeColor[2]);
//       };break;
//     }
   
// }
// //材质变量
// function matValueChange(event)
// {
//     switch(event.target)
//     {
//       case fresnelMatPow:{
//         selfMat.uniforms.fresnelPow.value =fresnelMatPow.value;
//       };break;
//       case fresnelMatPower:{
//         selfMat.uniforms.fresnelPower.value =fresnelMatPower.value;
//       };break;
//     }
// }
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
    initShader();
    // initMat();
    initRender();
    initScene();
    initCamera();
    initLight();
    initMap();
    initControls();
    animate();
    document.addEventListener(`mousemove`,onMouseMove,false);
    document.addEventListener(`pointermove`,rayCastEvent);
    document.addEventListener(`click`,mapClick);
    window.onresize = onWindowResize;
}