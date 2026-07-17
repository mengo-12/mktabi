"use client";

import LeftSidebar from "./LeftSidebar";
import CenterCanvas from "./CenterCanvas";
import RightProperties from "./RightProperties";

export default function BuilderLayout() {

    return (

        <div className="mr-64 flex h-[calc(100vh-70px)] overflow-hidden bg-zinc-950">

            <LeftSidebar />

            <CenterCanvas />

            <RightProperties />

        </div>

    );

}