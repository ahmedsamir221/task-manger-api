const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')


const app = express()
const port = process.env.PORT 

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port, ()=> {
    console.log('all is done in port ' + port)
})


// const User = require('./models/user')
// const Task = require('./models/task')


// const main = async function () {
//     // const temp = new Task ({
//     //     describtion: 'hi from the other side',
//     //     owner: 'ahmed'
//     // })
//     // await temp.save();
//     const task = await Task.findById({_id: '5f5bf505a0e74e27147f5c57'})
//     console.log(task)
//     await task.populate('owner').execPopulate()
//     console.log(task.owner)
// }

// main()