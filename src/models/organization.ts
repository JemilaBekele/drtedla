import mongoose from "mongoose";



const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
   
  },
  address: {
    type: String,
 
  },
  phone: {
    type: String,
  },
  website: {
    type: String,
 
  },
  email: {
    type: String,
 
  },
}, 
{
  timestamps: true,
  strictPopulate: false,
});

const Organization = mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);

export default Organization;