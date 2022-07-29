// CHART START
const width = 1500
const height = 650
const margin = {
    top:10,
    bottom:40,
    left:160,
    right:10
}

//constantes
let dataTotal 
let dataWorldCup //data que contendra los paises ordenados
let contador = 1 //se usara en el bucle para contar nº de victorias
let resultado = [] // almacenará array con objetos {pais:valor,copas:valor]
let max // almacenará el máximo de copas

//Creamos con d3 un svg dentro del body
const svg = d3.select("#chart")
    .append("svg")
    .attr("width",width)
    .attr("height",height)

//Generamos un label para el eje
svg.append("text")
.attr("class","xAxis_label") 
.attr("text-anchor", "end") 
.attr("x", width/1.7) 
.attr("y", height - 1)
.text("cups won");

//Creamos con d3 un svg para el slider
var gTime = d3
    .select('#slider-time')  // div donde lo insertamos
    .append('svg')    
    .attr('width', width )
    .attr('height', 100)    
    .attr('transform', 'translate(0,30)');

const elementGroup = svg.append("g").attr("transform", `translate(0,${margin.top})`)
const axisGroup = svg.append("g").attr("id","axisGroup")
const xAxisGroup = axisGroup.append("g").attr("transform", `translate(${margin.left},${height-margin.bottom})`)
const yAxisGroup = axisGroup.append("g").attr("transform", `translate(${margin.left},${margin.top})`)
const sliderGroup = gTime.append("g")

//Defino la escala:
const x = d3.scaleLinear()
    .range([0,width - margin.left - margin.right])
const y = d3.scaleBand()
    .range([height - margin.top -margin.bottom,0]).padding(0.1)

//Definimos los ejes:
const xAxis = d3.axisBottom(x)
const yAxis = d3.axisLeft(y)

//Cargamos el fichero y realizamos la llamada a las diferentes funciones que realizan el tratamiento de datos y la carga de objetos
d3.csv("data.csv").then(data => { 
    d3.values(data).map(d => d.year =+d.year)
    dataTotal=data       
    slider() //Lamamos a la función slider para generarlo
    dataTreatment(dataTotal)// LLamamos a la función update para crear la gráfica con los valores predefinidos
})


//################### Declaramos las funciones necesarias ############################

//Creamos la función que modificará el color de la barra del pais con mas copas
function color (barra) {
    if(barra === max){
        return "chartMax"
    }else{
        return "chartMin"
    }
}


//Función que realiza el filtrado en base al año obtenido en el slider
function makeFilter(filter_values){
    dataTotalFiltred = dataTotal.filter(d => d.year <= filter_values)
    dataTreatment(dataTotalFiltred) 
}

//Función que realiza el cálculo del número de veces que ganó cada pais 
function dataCreate(dataWorldCup) {
    for(let i = 0; i < dataWorldCup.length; i++){ 
        if(dataWorldCup[i+1] === dataWorldCup[i] & dataWorldCup[i]!=""){            
            contador++;
        }else{
            if(dataWorldCup[i] != ""){
                resultado.push({
                country : dataWorldCup[i],
                cups: contador})
            contador = 1
        }}             
    } 
    return resultado 
}
//Función que realiza la creación actualización y eliminación de barras
function makeRect (rect) {
    rect.enter()
        .append("rect")
        .attr("class",  d => color(d.cups))
        .attr("x",margin.left)
        .attr("y", d => y(d.country))
        .attr("height", y.bandwidth())
        .transition()
        .duration(300)
        .attr("width", d => x(d.cups))

    rect
        .attr("class",  d => color(d.cups))
        .attr("x",margin.left)
        .attr("y", d => y(d.country))
        .attr("height", y.bandwidth())
        .transition()
        .duration(300)
        .attr("width", d => x(d.cups))

    rect.exit()
        .transition()
        .duration(300)
        .attr("width",0)
        .remove()
}
//Función que realiza la creación actualización y eliminación de texo en barras
function makeText(texto){
    texto.enter()
        .append("text")            
        .text(d => d.cups)
        .attr("x",d => x(d.cups))
        .attr("y", d => y(d.country))
        .attr("transform", `translate(60,${margin.bottom})`)
        .attr("class","cups")
        .transition()
        .duration(300)
            
    texto
        .text(d => d.cups)
        .attr("class","cups")
        .attr("x",d => x(d.cups))
        .attr("y", d => y(d.country))
        .attr("transform", `translate(60,${margin.bottom})`)
        .transition()
        .duration(300)
        
    texto.exit()
        .transition()
        .duration(300)
        .attr("width",0)
        .remove()
}
//Función que realiza el tratamiento de los datos y dibuja las barras, ejes y texto
function dataTreatment(dataTotalFiltred) { 
    dataWorldCup = dataTotalFiltred.map(d => d.winner).sort()  
       
    resultado = dataCreate(dataWorldCup)//llamaos a la función que realiza el conteo de copas y crea la data

    //Ordenamos en función de las copas en orden descendente
    resultado = resultado.sort(function(a,b){
        return(a.cups-b.cups)
    })
    
    //almacenamos el maximo de copas en la variable max que usaremos en la funcion color
    max = d3.max(resultado.map(d => d.cups)) 
    
    //Dominios
    x.domain([0,d3.max(resultado.map(d => d.cups))])
    y.domain(resultado.map(d => d.country))
    
    //Dibujamos los ejes:
    xAxis.ticks(max)  // ajustamos el numero de ticks del eje x al numero max de copas en cada momento
    xAxisGroup
        .transition()
        .duration(300)
        .call(xAxis)
        .attr("class","Axis")        
    yAxisGroup
        .transition()
        .duration(300)
        .call(yAxis)
        .attr("class","Axis")    
    
    //Generar barras mediante data binding:
    let rect = elementGroup.selectAll("rect").data(resultado)
    rect.call(makeRect) //llamamos a la función que crea las barras

    let texto = elementGroup.selectAll("text").data(resultado)
    texto.call(makeText)//llamamos a la función que crea los textos en las barras
}
// slider:
function slider() {    
    var sliderTime = d3
        .sliderBottom()
        .min(d3.min(dataTotal.map(d=>d.year)))  // rango años
        .max(d3.max(dataTotal.map(d=>d.year)))
        .step(4)  // cada cuánto aumenta el slider
        .width(800)  // ancho de nuestro slider
        .ticks(dataTotal.length)  
        .default(d3.max(dataTotal.map(d=>d.year)))  // punto inicio de la marca
        .on('onchange', val => {
            try{
                resultado=[] //Formateamos la variable resultado de la función update
                d3.select('p#value-time')
                    .text(d3.format('')(val))   //Insertamos el valor de slider en pantalla
                    .attr("class","year-slider") 
                    
                filter_value = val                
                makeFilter(filter_value) //llamamos a la función filter_value, para filtrar la data en base al año sellecionado
                
            }catch{console.log("La función aún no está conectada con la gráfica")}
            
        })
        

        gTime.call(sliderTime);
        
        d3.select('#value-time')
            .text([sliderTime.value()])
            .attr("class","year-slider")
            
            
}                                                       






