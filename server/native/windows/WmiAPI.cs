using System;
using System.Management;
using System.Threading.Tasks;

namespace WmiAPI
{
  public class Startup
  {
    private static ManagementObject wmiGetObject;
    private static ManagementObject wmiSetObject;
    private static ManagementClass wmiGetClass;
    private static ManagementClass wmiSetClass;

    public async Task<object> InitWmi(object input)
    {
      Tuple<ManagementClass, ManagementObject> getTuple = GetWmiClassAndObject("GB_WMIACPI_Get");
      Tuple<ManagementClass, ManagementObject> setTuple = GetWmiClassAndObject("GB_WMIACPI_Set");
      wmiGetClass = getTuple.Item1;
      wmiGetObject = getTuple.Item2;
      wmiSetClass = setTuple.Item1;
      wmiSetObject = setTuple.Item2;

      return null;
    }

    public async Task<object> WmiGet(dynamic input)
    {
      if(wmiGetObject == null) {
        throw new Exception("You forgot to call InitWmi()!");
      }

      string methodName = (string)input.methodName;

      ManagementBaseObject methodParameters = null;
      if (input.args != null)
      {
        methodParameters = wmiGetClass.GetMethodParameters(methodName);
        foreach (var property in input.args)
        {
          methodParameters[property.Key] = property.Value;
        }
      }

      ManagementBaseObject result = wmiGetObject.InvokeMethod(methodName, methodParameters, null);

      // Create a return object that can be easily read in JS
      PropertyDataCollection properties = result.Properties;
      object[] ret = new object[properties.Count];
      int idx = 0;
      foreach (PropertyData property in properties)
      {
        // Double because of JS' number type
        ret[idx] = Convert.ToDouble(property.Value);
        idx++;
      }
      return ret;
    }

    public async Task<object> WmiSet(dynamic input)
    {
      if(wmiSetObject == null) {
        throw new Exception("You forgot to call InitWmi()!");
      }

      string methodName = (string)input.methodName;

      ManagementBaseObject methodParameters = null;
      if (input.args != null)
      {
        methodParameters = wmiSetClass.GetMethodParameters(methodName);
        foreach (var property in input.args)
        {
          methodParameters[property.Key] = property.Value;
        }
      }

      ManagementBaseObject result = wmiSetObject.InvokeMethod(methodName, methodParameters, null);

      return null;
    }

    private static Tuple<ManagementClass, ManagementObject> GetWmiClassAndObject(string className)
    {
      ManagementScope scope = new ManagementScope("root\\WMI", new ConnectionOptions
      {
        EnablePrivileges = true,
        Impersonation = ImpersonationLevel.Impersonate
      });
      ManagementPath path = new ManagementPath(className);
      ManagementClass wmiClass = new ManagementClass(scope, path, null);
      ManagementObjectCollection.ManagementObjectEnumerator enumerator = wmiClass.GetInstances().GetEnumerator();

      if (enumerator.MoveNext())
      {
        return new Tuple<ManagementClass, ManagementObject>(wmiClass, (ManagementObject)enumerator.Current);
      }

      return null;
    }

  }
}
