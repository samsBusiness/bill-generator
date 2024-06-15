import {BForm} from "@/components/billForm";
import {GetServerSideProps} from "next";
import React from "react";
import FormattedBill from "@/components/formattedBill";
interface props {
  form: BForm;
}
const BillPdf: React.FC<props> = ({form}) => {
  return <FormattedBill form={form} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {query} = context;
  const form = JSON.parse(query.data as string);

  return {
    props: {
      form,
    },
  };
};

export default BillPdf;
