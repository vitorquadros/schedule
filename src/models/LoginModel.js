const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');

const LoginSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const LoginModel = mongoose.model('Login', LoginSchema);

class Login {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.user = null;
  }

  async register() {
    this.valida();
    if (this.errors.length > 0) return;

    await this.userExists();

    if (this.errors.length > 0) return;


    const salt = bcryptjs.genSaltSync();
    this.body.password = bcryptjs.hashSync(this.body.password, salt);

    try {
      this.user = await LoginModel.create(this.body);
    } catch (e) {
      console.log(e);
    }
  }

  async userExists() {
    const user = await LoginModel.findOne({ email: this.body.email });
    if(user) this.errors.push('Usuário ja existe.');
  }

  valida() {
    // O email precisa ser valido
    // A senha precisa ter entre 8 e 24 caracteres
    this.cleanUp();
    if (!validator.isEmail(this.body.email)) this.errors.push('Email inválido.');
    if (this.body.password < 8 || this.body.password.length > 24) {
      this.errors.push('A senha precisa ter entre 8 e 24 caracteres.');
    }
  }

  cleanUp() {
    for (const key in this.body) {
      if (typeof this.body[key] !== 'string') {
        this.body[key] = '';
      }
    }

    this.body = {
      email: this.body.email,
      password: this.body.password
    }
  }

}

module.exports = Login;
