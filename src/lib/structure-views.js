export const familySubmaps={
 carotenoids:[{id:'carotenoid-frameworks',label:['Framework branches','골격 분기']},{id:'carotenoids',label:['Full pathway','상세 경로']}],
 diterpenes:[{id:'diterpenes',label:['Precursor & framework map','전구체와 골격 지도']},{id:'diterpene-rings',label:['Ring fusion & rearrangements','고리 융합과 재배열']}]
};
export const structureViewGroup=id=>id==='carotenoid-frameworks'?'carotenoids':id==='diterpene-rings'?'diterpenes':id;
export const structureGraphId=id=>id==='diterpene-rings'?'scaffolds':id;
