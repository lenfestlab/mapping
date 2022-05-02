
const getTopics = async function(collection_id) {
  return await fetch("https://lenfest-mapping.herokuapp.com/collections/" + collection_id + "/topics.json").then(resp=>{ return resp.json(); });
}

const getAuthors = async function(collection_id) {
  return await fetch("https://lenfest-mapping.herokuapp.com/collections/" + collection_id + "/authors.json").then(resp=>{ return resp.json(); });
}

const getCounties = async function(collection_id) {
  return await fetch("https://lenfest-mapping.herokuapp.com/collections/" + collection_id + "/counties.json?v=1").then(resp=>{ return resp.json(); });
}

const getCensusTracts = async function(collection_id) {
  return await fetch("https://lenfest-mapping.herokuapp.com/collections/" + collection_id + "/census_tracts.json").then(resp=>{ return resp.json(); });
}

const getNeighborhoods = async function(collection_id) {
  return await fetch("https://lenfest-mapping.herokuapp.com/collections/" + collection_id + "/neighborhoods.json").then(resp=>{ return resp.json(); });
}
