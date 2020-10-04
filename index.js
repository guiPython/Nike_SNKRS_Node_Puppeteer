const puppeteer = require('puppeteer');
const cron = require('node-cron');
const readLine = require('readline');
const rs = readLine.createInterface(process.stdin,process.stdout)


const Order = require('./src/order')
const login = require('./src/login')
const EvalTxt = require('./src/evalTxt')

async function run () {

    var date = new Date()
    const array_info = EvalTxt.infotxt()

    if ( EvalTxt.eval(array_info) ){

        try{
            console.log('\nBOT_TARS INICIADO')
            const path_folder = await Order.mkDirOrder(array_info[6],array_info[2])
            const timeL = array_info[5].split('-')
            date = Date.parse(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${timeL[0]}:${timeL[1]}`)
            console.log(`\nData: ${date}`)
            const [ product , id , size ] = [ array_info[2] , array_info[3] , array_info[4] ] 
            //const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || (process.pkg ? path.join(path.dirname(process.execPath),'puppeteer',...puppeteer.executablePath().split(path.sep).slice(6),) : puppeteer.executablePath())
            
            const browser = await puppeteer.launch({ headless:false , ignoreHTTPSErrors:true , executablePath:`${array_info[7]}`})
            const page = await browser.newPage()
            page.setDefaultNavigationTimeout(0)
            await page.setViewport({ width:1920 , height:1080})
            await page.goto('https://www.nike.com.br')
            await page.screenshot({path: `${path_folder}/home_page.png`})

            // Login 
            await login( array_info[0], array_info[1] , page , path_folder )

            // Order
            if ( Date.now() < date ){ 
                cron.schedule(`${timeL[1]} ${timeL[0]} * * *`, async () => { Order.init_Order( page , path_folder , product , id , size , browser ) })}
            else { Order.initOrder( page , path_folder , product , id , size , browser ) }
        }
        catch(err){
            console.log(err)
            rs.question('\nOcorreu um erro na execucao do programa , precione ENTER e execute novamente.',(res)=>{process.exit()})
        }}
        else{
            console.log('Insira todas as informacoes em info.txt\n')
            rs.question('Precione ENTER e execute novamente.',()=>{process.exit()})
        }
} 
run()
