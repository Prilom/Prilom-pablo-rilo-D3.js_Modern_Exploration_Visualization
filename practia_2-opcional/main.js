//Definimos las constates
const diCaprioBirthYear = 1974;
const age = function(year) { return year - diCaprioBirthYear}
const today = new Date().getFullYear()
const ageToday = age(today)
const width = 1000
const height = 500
const margin = {
    top:10, 
    bottom: 40,
    left:75, 
    right: 15
}
let max = 0 //constante con la que calcularemos las novias con mayor edad
// ----------------------------------------------------------
  
//Creamos el svg y los grupos
const svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height)
const diCaprioGroup = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
const womanGroup = svg.append("g")
    .attr("class", "womanGroup")
    .attr("transform", `translate(${margin.left},${margin.top})`)
const legend = svg.append("g")    
    .attr("transform",`translate(${margin.left},${margin.top})`)
    .attr("height", 100)
    .attr("width", 100);
const axisGroup = svg.append("g")
const xAxisGroup = axisGroup.append("g")
    .attr("class", "xAxisGroup")
    .attr("transform", `translate(${margin.left},${height-margin.bottom})`)
const yAxisGroup = axisGroup.append("g")
    .attr("class", "yAxisGroup")
    .attr("transform", `translate(${margin.left},${margin.top})`)


//Declaramos parte de la scala
const x = d3.scaleLinear().range([0, width - margin.left - margin.right])
const y = d3.scaleLinear().range([height - margin.top - margin.bottom, 0])

//Declaramos los ejes
const xAxis = d3.axisBottom().scale(x)
const yAxis = d3.axisLeft().scale(y)


//Función que filtra la data para obtener solo los valores que son máximos
function makeMax(data){    
    dataFiltred = data.filter(d => d.age === max)
    return dataFiltred  
}

//Declaramos la función que crea dentro del grupo de leyenda los objetos           
function legendCreate(group) {
    group.append("text")
        .attr("class", "legend")
        .text("--o-- DiCaprio Age")
        .attr("class","diCaprioGroup")
        .attr("x", 65)
        .attr("y", 25)
    group.append("text")
        .attr("class","womanGroup")
        .text("DiCaprio Girlfriends Age")
        .attr("x", 99)
        .attr("y", 50)
    group.append("rect")
        .attr("class","womanGroup")
        .attr("x", 65)
        .attr("y", 40)
        .attr("width", 30)
        .attr("height", 10)
    group.append("text")
        .text("Age Limit Leo´s Girldfriends")
        .attr("class", "womanGroup")
        .attr("x", 525)
        .attr("y", 255)   
    
    
}
//Declaramos la función que crea dentro del grupo de las novias los objetos
function womanCreate(group) {
    group.append("rect")
            .attr("class","womanGroup")
            .attr("x", d => x(d.year)-10)
            .attr("y", d => y(d.age))
            .attr("height", d => height - margin.bottom - margin.top - y(d.age) )
            .attr("width", 20)
               
    group.append("text")
            .text(d=>d.age)
            .attr("class",d=>d.name)
            .attr("x", d => x(d.year)-8)
            .attr("y", d => y(d.age)-13)
            .attr("height", d => height - margin.bottom - margin.top - y(d.age) )
            .attr("width", 20)
    
    
}
//Declaramos la función que crea dentro del grupo de dicaprio los objetos
function diCaprioCreate(group) {
    group.append("circle")
        .attr("class","diCaprioGroup")
        .attr("class", d => d.LeoAge)
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.LeoAge))
        .attr("r", 5)

    group.append("text")
        .text(d=>d.LeoAge)
        .attr("class", d => d.LeoAge)
        .attr("x", d => x(d.year)-10)
        .attr("y", d => y(d.LeoAge)-10) 

    
}
//Accedemos al archivo con el dataset
d3.csv("data.csv").then(data =>{
    //Tratamos los datos para generar la gráfica
    d3.values(data).map(d => d.year = +d.year)
    d3.values(data).map(d => d.age = +d.age)    
    d3.values(data).map(d => d.LeoAge = age(d.year))
    max = d3.max(data.map(d => d.age)) //Sacamos la edad maxima de las novias de LeoDicaprio
    let dataFiltred =makeMax(data) //Filtramos la data en base al max. para obtener los puntos maximos del chart
    
    //Acabamos de definir la escala
    x.domain([1997,d3.max(data.map(d => d.year))+1])
    y.domain([15,d3.max(data.map(d => d.LeoAge))+1])
    
    //Hacemos la llamada a los ejes
    xAxisGroup.call(xAxis).attr("class", "axis")
    yAxisGroup.call(yAxis).attr("class", "axis")


    //Genero unos div para las etiquetas de los nombre de las novias
    var tip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)

    //Hacemos la llamada a la función que crea los datos de la leyenda
    legend.call(legendCreate) 
    legend.datum(dataFiltred)
        .append("path")
        .attr("id", "line")
        .attr("d", d3.line()
        .x(d => x(d.year))
        .y(d => y(27.5)))
    

    //Hacemos data binding y Hacemos la llamada a la función que crea los objetos de las novias
    let elementsWoman = womanGroup.selectAll("g").data(data)
        elementsWoman.enter()
            .append("g")
            .call(womanCreate) 
            .on("mouseover", function(d) {
                tip.style("opacity", 1)
                    .html(d.name)
                    .style("left", (d3.event.pageX+"px") )
                    .style("top", (d3.event.pageY+"py"))
                })
            .on("mouseout", function(d) {
            tip.style("opacity", 0)
            })
    
    //Creamos la linea que representa la edad de Leo Dicaprios
    diCaprioGroup.datum(data)
            .attr("id", "line")
            .append("path")
            .attr("d", d3.line()
                .x(d => x(d.year))
                .y(d => y(d.LeoAge)))
    
    //Hacemos data binding y hacemos la llamada a la función que crea los objetos de Leo en el grupo
    let elementsDiCaprio = diCaprioGroup.selectAll("g").data(data)
        elementsDiCaprio.enter()
            .append("g")
            .call(diCaprioCreate)   
    
    //Insertamos unos circulos rojos en los valores máximos
    womanGroup.selectAll("circle").data(dataFiltred)
        .join("circle")
        .attr("class","task")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.age)-17)
        .attr("r", 18) 

})