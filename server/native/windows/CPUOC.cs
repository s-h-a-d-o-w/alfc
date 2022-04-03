using System;
using System.Management;
using System.Threading;
using System.Threading.Tasks;
using Intel.Overclocking.SDK.Tuning;

namespace CPUOC
{
  public class Startup
  {
    private static ITuningLibrary tuning;
    private static uint pl1id = 48;
    private static uint pl2id = 47;

    public async Task<object> Init(object input)
    {
      tuning = TuningLibrary.Instance;
      return tuning.InitializeCheck();
    }

    public async Task<object> Tune(dynamic input)
    {
      if(tuning == null) {
        throw new Exception("You forgot to call Init()!");
      }

      // Not sure that sleeping is necessary but Gigabyte does it and 
      // with something like this, it probably makes sense to prevent accidental
      // hammering of the API.
      try
      {
        tuning.Tune(pl1id, (decimal)input.pl1, false);
        Thread.Sleep(500);
        tuning.Tune(pl2id, (decimal)input.pl2, false);
        Thread.Sleep(500);
      }
      catch (Exception ex)
      {
        // Console.WriteLine(ex);
        throw ex;
      }
      
      return null;
    }
  }
}
