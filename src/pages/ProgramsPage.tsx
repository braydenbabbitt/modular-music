import { Outlet } from "react-router-dom";
import { ProgramCard } from "../components/Cards";

export const ProgramsPage = () => {
  return (
    <>
      <h1>My Programs</h1>
      <ProgramCard name='Test name' route='/programs/demo' />

      <Outlet />
    </>
  );
};