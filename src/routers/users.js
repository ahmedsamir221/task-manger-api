const express = require('express')
const router = new express.Router()
const users = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { welcomeEmailMessage, deleteEmailMessage } = require('../emails/account')


router.post('/user', async (req, res) => {
    const user = new users(req.body)
    try {
        await user.save()
        welcomeEmailMessage(user.email, user.name)
        const token = await user.generatAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(404).send(e)
    }
})

router.post('/user/login', async (req, res) => {
    try {
        const user = await users.findByCredentials(req.body.email, req.body.password)
        const token = await user.generatAuthToken()
        res.status(200).send({user, token})
    } catch (e) {
        res.status(404).send(e)
    }
})

router.post('/user/logout', auth, async (req, res) => {
    try {
        const user = req.user
        user.tokens = user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/user/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})


router.get('/user/me', auth, (req, res) => {
    res.send(req.user)
})


router.patch('/user/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const alloweUpdates = ['name', 'age', 'email', 'password']
    const valid = updates.every((update) => alloweUpdates.includes(update))

    if(!valid){
        return res.status(404).send('error : update not found')
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()        
        res.status(201).send(req.user)
    } catch (e) {
        res.status(404).send(e)
    }

})

router.delete('/user/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        deleteEmailMessage(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(404).send(e)
    }
})


const upload = multer({
     limits: {
        fileSize: 1000000
     },
     fileFilter (req, file, cb) {
         if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
             return cb(new Error('accepted type are jpg|jpeg|png'))
         }
         cb(undefined,true)
     }
})

router.post('/user/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, nxet) => {
    res.status(400).send({
        erorr: error.message
    })
})


router.delete('/user/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    try {
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})


router.get('/user/:id/avatar', async (req, res) => {
    try {
        const user = await users.findById(req.params.id)
        if(!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router