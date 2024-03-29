import {
  QueryMethod,
  getModelForClass,
  index,
  pre,
  prop,
} from "@typegoose/typegoose";
import { IsEmail, MaxLength, MinLength } from "class-validator";
import { Field, InputType, ObjectType } from "type-graphql";
import bcrypt from "bcrypt";
import { saltRounds } from "../constants/hash";
import { AsQueryMethod, ReturnModelType } from "@typegoose/typegoose/lib/types";

function findByEmail(
  this: ReturnModelType<typeof User, QueryHelpers>,
  email: User["email"]
) {
  return this.findOne({ email });
}

interface QueryHelpers {
  findByEmail: AsQueryMethod<typeof findByEmail>;
}

@pre<User>("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(this.password, salt);
  this.password = hash;
})
@index({ email: 1 })
@QueryMethod(findByEmail)
@ObjectType()
export class User {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({ required: true })
  name: string;

  @Field(() => String)
  @prop({ required: true })
  email: string;

  @prop({ required: true })
  password: string;
}

export const UserModel = getModelForClass<typeof User, QueryHelpers>(User);

@InputType()
export class CreateUserInput {
  @Field(() => String)
  name: string;

  @IsEmail()
  @Field(() => String)
  email: string;

  @MinLength(6, {
    message: "Password must me at least 6 characters long",
  })
  @MaxLength(50, {
    message: "Password must me at least 50 characters long",
  })
  @Field(() => String)
  password: string;
}

@InputType()
export class LoginInput {
  @IsEmail()
  @Field(() => String)
  email: string;

  @MinLength(6, {
    message: "Password must me at least 6 characters long",
  })
  @Field(() => String)
  password: string;
}

@ObjectType()
export class LoginResponse extends User {
  @Field(() => String)
  token: string;
}
