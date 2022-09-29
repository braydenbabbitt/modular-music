import { Paper } from "@mantine/core";
import { Link } from "react-router-dom";

type ProgramCardProps = {
  name: string,
  route: string,
};

export const ProgramCard = ({ name, route }: ProgramCardProps) => {
  console.log(name);

  return (
    <Paper shadow='sm' radius='md' withBorder={true} component={Link} to={route}>{name}</Paper>
  );
};