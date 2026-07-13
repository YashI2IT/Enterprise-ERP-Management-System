import mongoose, { Document, Schema } from 'mongoose';
import argon2 from 'argon2';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  PRINCIPAL = 'PRINCIPAL',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  ACCOUNTANT = 'ACCOUNTANT',
  LIBRARIAN = 'LIBRARIAN',
  WARDEN = 'WARDEN',
  RECEPTIONIST = 'RECEPTIONIST',
  HR = 'HR',
  STAFF = 'STAFF',
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: Role;
  isActive: boolean;
  lastLogin: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.STUDENT,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await argon2.hash(this.password as string);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await argon2.verify(this.password, candidatePassword);
};

export const User = mongoose.model<IUser>('User', userSchema);
