import { SignupForm } from "@/components/signup-form"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Enter your email below to create your account</p>
        </div>
        <SignupForm />
        <p className="text-center text-sm text-muted-foreground">
          Created by{" "}
          <Link href="/credits" className="font-medium hover:underline">
            TENNET
          </Link>
        </p>
      </div>
    </div>
  )
}

