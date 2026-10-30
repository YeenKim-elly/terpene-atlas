export const familySubmaps={
  "monoterpenes": [
    {
      "id": "monoterpenes",
      "label": [
        "Framework branches",
        "골격 분기"
      ]
    },
    {
      "id": "iridoids",
      "label": [
        "Iridoid pathway",
        "Iridoid 경로"
      ]
    }
  ],
  "sesquiterpenes": [
    {
      "id": "sesquiterpenes",
      "label": [
        "Framework branches",
        "골격 분기"
      ]
    },
    {
      "id": "artemisinin",
      "label": [
        "Artemisinin pathway",
        "Artemisinin 경로"
      ]
    }
  ],
  "diterpenes": [
    {
      "id": "diterpenes",
      "label": [
        "Precursor & framework map",
        "전구체와 골격 지도"
      ]
    },
    {
      "id": "diterpene-pathway",
      "label": [
        "Full pathway",
        "전체 경로"
      ]
    },
    {
      "id": "gibberellins",
      "label": [
        "Gibberellin pathway",
        "Gibberellin 경로"
      ]
    },
    {
      "id": "diterpene-rings",
      "label": [
        "Ring fusion & rearrangements",
        "고리 융합과 재배열"
      ]
    }
  ],
  "carotenoids": [
    {
      "id": "carotenoid-frameworks",
      "label": [
        "Framework branches",
        "골격 분기"
      ]
    },
    {
      "id": "carotenoids",
      "label": [
        "Full pathway",
        "전체 경로"
      ]
    },
    {
      "id": "plant-carotenoids",
      "label": [
        "Plant poly-cis pathway",
        "식물 poly-cis 경로"
      ]
    },
    {
      "id": "astaxanthin-esters",
      "label": [
        "Astaxanthin esters",
        "Astaxanthin ester"
      ]
    },
    {
      "id": "aba-cleavage",
      "label": [
        "Cleavage → ABA",
        "절단 → ABA"
      ]
    }
  ]
};
export const structureViewGroup=id=>Object.entries(familySubmaps).find(([,views])=>views.some(view=>view.id===id))?.[0]||id;
export const structureGraphId=id=>id==='diterpene-rings'?'scaffolds':id;
