"use client"
import Head from "next/head"
import LandingPage from "./components/landing/LandingPage"

export default function LayoutPage() {
  return (
    <>
      <Head>
        <link rel="icon" href="/images/favicon.ico" type="image/x-icon" />
      </Head>
      <LandingPage />
    </>
  )
}
