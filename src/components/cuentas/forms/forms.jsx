import FormCreateMonth from "./form-create-month";
import FormCreate from "./form-create";
import { useParams } from "react-router-dom";

const Forms = () => {
  const { id } = useParams();

  return (
    <>
      <FormCreate id={id} />
      <FormCreateMonth id={id} />
    </>
  );
};

export default Forms;
