const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const schema = mongoose.Schema
const userSchema = new schema ({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error ('email is not valid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value){
            if(value.length < 8){
                throw new Error ('password less than 8 characters')
            }
        }
    } ,
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})
userSchema.virtual('tasks' , {
    ref: 'task',
    localField: '_id',
    foreignField: 'owner'
})
userSchema.methods.toJSON = function () {
    const user = this
    const objuser = user.toObject()
    delete objuser.password
    delete objuser.tokens
    return objuser
}
userSchema.methods.generatAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JSONWEBTOKEN_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}
userSchema.statics.findByCredentials = async (email , password) => {
    user = await users.findOne({email})
    if(!user){
        throw new Error ('unable to login ')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error ('unable to login ')
    }
    return user
}

userSchema.pre('save', async function (next) {
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})



const users = mongoose.model('users',userSchema) 
module.exports = users