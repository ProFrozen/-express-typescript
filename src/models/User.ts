/**
 * Define User model
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */

import * as crypto from 'crypto';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt-nodejs';

// import mongoose from '../providers/Database';
import { IUser } from '../interfaces/user';

// Create the model schema & register your custom methods here
export interface IUserModel extends IUser, mongoose.Document {
	billingAddress(): string;
	comparePassword(password: string, cb: any): string;
	gravatar(_size: number): string;
}

// Define the User Schema
export const UserSchema = new mongoose.Schema({
	email: { type: String, unique: true },
	password: { type: String },
	passwordResetToken: { type: String },
	passwordResetExpires: Date,

	facebook: { type: String },
	twitter: { type: String },
	google: { type: String },
	github: { type: String },
	instagram: { type: String },
	linkedin: { type: String },
	steam: { type: String },
	tokens: { type: String },

	fullname: { type: String },
	gender: { type: String },
	geolocation: { type: String },
	website: { type: String },
	picture: { type: String }
}, {
	timestamps: true
});

// Password hash middleware
UserSchema.pre<IUserModel>('save', function (_next) {
	const user = this;
	if (!user.isModified('password')) {
		_next();
	}

	bcrypt.genSalt(10, (_err, _salt) => {
		if (_err) {
			_next(_err);
		}

		bcrypt.hash(user.password, _salt, null, (_err, _hash) => {
			if (_err) {
				_next(_err);
			}

			user.password = _hash;
			_next();
		});
	});
});

// Custom Methods
// Get user's full billing address
UserSchema.methods.billingAddress = function (): string {
	const fulladdress = `${this.fullname.trim()} ${this.geolocation.trim()}`;
	return fulladdress;
};

// Compares the user's password with the request password
UserSchema.methods.comparePassword = function (_requestPassword, _cb): any {
	bcrypt.compare(_requestPassword, this.password, (_err, _isMatch) => {
		_cb(_err, _isMatch);
	});
};

// User's gravatar
UserSchema.methods.gravatar = function (_size): any {
	if (! _size) {
		_size = 200;
	}

	const url = 'https://gravatar.com/avatar';
	if (! this.email) {
		return `${url}/?s=${_size}&d=retro`;
	}

	const md5 = crypto.createHash('md5').update(this.email).digest('hex');
	return `${url}/${md5}?s=${_size}&d=retro`;
};

const User = mongoose.model<IUserModel>('User', UserSchema);

export default User;
