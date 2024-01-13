import DefaultIdea from "./DefaultIdea";

const defaultIdeas = [
  {
    idea: "Investments",
    moreContext: "What are SLR Investments->",
  },
  {
    idea: "Loan Rversal",
    moreContext:
      "What are reversal of loan?->",
  },
  { idea: "Eligiblity", moreContext: "What are Eligiblities" },
  {
    idea: "MTLGD",
    moreContext: "How to Redeem MTLGD?->",
  },
];

export default function DefaultIdeas({ visible = true }) {
  return (
    <div className={`row1 ${visible ? "block" : "hidden"}`}>
      <DefaultIdea ideas={defaultIdeas.slice(0, 2)} />
      <DefaultIdea
        ideas={defaultIdeas.slice(2, 4)}
        myclassNames="hidden md:visible"
      />
    </div>
  );
}
